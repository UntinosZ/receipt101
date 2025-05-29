"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Trash2, Search, QrCode, Globe, User } from "lucide-react"
import { supabase, type Receipt } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import QRCodeGenerator from "@/components/qr-code-generator"

export default function ReceiptGallery() {
  const [myReceipts, setMyReceipts] = useState<Receipt[]>([])
  const [publicReceipts, setPublicReceipts] = useState<Receipt[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReceipts()
  }, [])

  const loadReceipts = async () => {
    setLoading(true)
    try {
      // Load public receipts
      const { data: publicData, error: publicError } = await supabase
        .from("receipts")
        .select(`
          *,
          template:templates(*)
        `)
        .eq("is_public", true)
        .order("created_at", { ascending: false })

      if (publicError) throw publicError
      setPublicReceipts(publicData || [])

      // Load user's receipts
      const { data: myData, error: myError } = await supabase
        .from("receipts")
        .select(`
          *,
          template:templates(*)
        `)
        .eq("created_by", "current_user") // In real app, use actual user ID
        .order("created_at", { ascending: false })

      if (myError) throw myError
      setMyReceipts(myData || [])
    } catch (error) {
      console.error("Error loading receipts:", error)
      toast({
        title: "Error",
        description: "Failed to load receipts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredMyReceipts = myReceipts.filter(
    (receipt) =>
      receipt.template?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredPublicReceipts = publicReceipts.filter(
    (receipt) =>
      receipt.template?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const deleteReceipt = async (id: string) => {
    try {
      const { error } = await supabase.from("receipts").delete().eq("id", id)

      if (error) throw error

      setMyReceipts((prev) => prev.filter((receipt) => receipt.id !== id))
      toast({
        title: "Success",
        description: "Receipt deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting receipt:", error)
      toast({
        title: "Error",
        description: "Failed to delete receipt",
        variant: "destructive",
      })
    }
  }

  const downloadReceipt = (receipt: Receipt) => {
    // Create a temporary receipt element for image generation
    const tempDiv = document.createElement("div")
    tempDiv.style.position = "absolute"
    tempDiv.style.left = "-9999px"
    tempDiv.style.width = "400px"
    tempDiv.style.padding = "24px"
    tempDiv.style.backgroundColor = receipt.template?.background_color || "#ffffff"
    tempDiv.style.color = receipt.template?.text_color || "#000000"
    tempDiv.style.fontFamily = receipt.template?.font_family || "sans-serif"
    tempDiv.style.fontSize = `${receipt.template?.font_size || 14}px`

    if (receipt.template?.show_border) {
      tempDiv.style.border = `2px solid ${receipt.template.border_color}`
    }

    tempDiv.innerHTML = `
    <div style="margin-bottom: 24px; text-align: ${receipt.template?.header_style || "center"};">
      ${
        receipt.template?.show_logo && receipt.template?.logo_url
          ? `<div style="margin-bottom: 16px; display: flex; justify-content: ${
              receipt.template.logo_position === "center" || receipt.template.header_style === "center"
                ? "center"
                : receipt.template.logo_position === "right"
                  ? "flex-end"
                  : "flex-start"
            };">
          <img src="${receipt.template.logo_url}" alt="Logo" style="width: ${receipt.template.logo_size}px; height: ${receipt.template.logo_size}px; object-fit: contain;" />
        </div>`
          : ""
      }
      <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 8px; color: ${receipt.template?.accent_color || "#3b82f6"};">
        ${receipt.template?.business_name || "Business"}
      </h1>
      ${receipt.template?.business_address ? `<p style="font-size: 14px; opacity: 0.8; white-space: pre-line;">${receipt.template.business_address}</p>` : ""}
      ${receipt.template?.business_phone ? `<p style="font-size: 14px; opacity: 0.8;">${receipt.template.business_phone}</p>` : ""}
      ${receipt.template?.business_email ? `<p style="font-size: 14px; opacity: 0.8;">${receipt.template.business_email}</p>` : ""}
    </div>
    
    <hr style="margin: 16px 0; border-color: ${receipt.template?.border_color || "#e5e7eb"};" />
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; font-size: 14px;">
      <div>
        <p style="font-weight: 500;">Receipt #:</p>
        <p style="color: ${receipt.template?.accent_color || "#3b82f6"};">${receipt.receipt_number}</p>
      </div>
      <div>
        <p style="font-weight: 500;">Date:</p>
        <p style="color: ${receipt.template?.accent_color || "#3b82f6"};">${receipt.receipt_date}</p>
      </div>
      ${
        receipt.customer_name
          ? `
        <div style="grid-column: span 2;">
          <p style="font-weight: 500;">Customer:</p>
          <p style="color: ${receipt.template?.accent_color || "#3b82f6"};">${receipt.customer_name}</p>
        </div>
      `
          : ""
      }
    </div>
    
    <hr style="margin: 16px 0; border-color: ${receipt.template?.border_color || "#e5e7eb"};" />
    
    <div style="margin-bottom: 16px;">
      <div style="display: grid; grid-template-columns: 6fr 2fr 2fr 2fr; gap: 8px; font-size: 12px; font-weight: 500; color: #6b7280; margin-bottom: 8px;">
        <div>Item</div>
        <div style="text-align: center;">Qty</div>
        <div style="text-align: right;">Price</div>
        <div style="text-align: right;">Total</div>
      </div>
      ${receipt.items
        .map(
          (item: any) => `
        <div style="display: grid; grid-template-columns: 6fr 2fr 2fr 2fr; gap: 8px; font-size: 14px; margin-bottom: 4px;">
          <div>${item.description}</div>
          <div style="text-align: center;">${item.quantity}</div>
          <div style="text-align: right;">$${item.price.toFixed(2)}</div>
          <div style="text-align: right;">$${(item.quantity * item.price).toFixed(2)}</div>
        </div>
      `,
        )
        .join("")}
    </div>
    
    <hr style="margin: 16px 0; border-color: ${receipt.template?.border_color || "#e5e7eb"};" />
    
    <div style="font-size: 14px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>Subtotal:</span>
        <span>$${receipt.subtotal.toFixed(2)}</span>
      </div>
      ${
        receipt.service_charge_amount > 0
          ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Service Charge (${receipt.service_charge_rate}%):</span>
          <span>$${receipt.service_charge_amount.toFixed(2)}</span>
        </div>
      `
          : ""
      }
      ${
        receipt.tax_amount > 0
          ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Tax (${receipt.tax_rate}%):</span>
          <span>$${receipt.tax_amount.toFixed(2)}</span>
        </div>
      `
          : ""
      }
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; padding-top: 8px; border-top: 1px solid ${receipt.template?.border_color || "#e5e7eb"};">
        <span>Total:</span>
        <span style="color: ${receipt.template?.accent_color || "#3b82f6"};">$${receipt.total.toFixed(2)}</span>
      </div>
    </div>
    
    ${
      receipt.notes
        ? `
    <hr style="margin: 16px 0; border-color: ${receipt.template?.border_color || "#e5e7eb"};" />
    <div style="font-size: 14px;">
      <p style="font-weight: 500; margin-bottom: 4px;">Notes:</p>
      <p style="opacity: 0.8; white-space: pre-line;">${receipt.notes}</p>
    </div>
    `
        : ""
    }
    
    ${
      receipt.template?.show_footer && receipt.template?.footer_text
        ? `
    <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #6b7280;">
      ${receipt.template.footer_text}
    </div>
    `
        : ""
    }
  `

    document.body.appendChild(tempDiv)

    // Use html2canvas to convert to image
    import("html2canvas").then((html2canvas) => {
      html2canvas
        .default(tempDiv, {
          backgroundColor: receipt.template?.background_color || "#ffffff",
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
        })
        .then((canvas) => {
          document.body.removeChild(tempDiv)

          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const link = document.createElement("a")
              link.href = url
              link.download = `receipt-${receipt.receipt_number}.png`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(url)
            }
          }, "image/png")
        })
    })
  }

  const generateQR = (receipt: Receipt) => {
    setSelectedReceipt(receipt)
    setShowQR(true)
  }

  const ReceiptCard = ({ receipt, showDeleteButton = false }: { receipt: Receipt; showDeleteButton?: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{receipt.template?.business_name || "Unknown Business"}</CardTitle>
            <p className="text-sm text-gray-600">{receipt.receipt_number}</p>
          </div>
          <div className="flex flex-col gap-1">
            {receipt.is_public && (
              <Badge variant="outline" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                Public
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {receipt.items.length} item{receipt.items.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Customer:</span>
            <span>{receipt.customer_name || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span>{receipt.receipt_date}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>${receipt.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => generateQR(receipt)} className="flex-1">
            <QrCode className="w-4 h-4 mr-1" />
            QR
          </Button>
          <Button size="sm" variant="outline" onClick={() => downloadReceipt(receipt)} className="flex-1">
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          {showDeleteButton && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteReceipt(receipt.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading receipts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search receipts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="my" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            My Receipts ({filteredMyReceipts.length})
          </TabsTrigger>
          <TabsTrigger value="public" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Public Receipts ({filteredPublicReceipts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="space-y-4">
          {filteredMyReceipts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "No receipts found matching your search." : "You haven't created any receipts yet."}
                </p>
                {!searchTerm && (
                  <p className="text-sm text-gray-400">Go to the "Create Receipt" tab to create your first receipt.</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMyReceipts.map((receipt) => (
                <ReceiptCard key={receipt.id} receipt={receipt} showDeleteButton={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          {filteredPublicReceipts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">
                  {searchTerm ? "No public receipts found matching your search." : "No public receipts available."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublicReceipts.map((receipt) => (
                <ReceiptCard key={receipt.id} receipt={receipt} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {showQR && selectedReceipt && (
        <QRCodeGenerator
          receiptData={selectedReceipt}
          onClose={() => {
            setShowQR(false)
            setSelectedReceipt(null)
          }}
        />
      )}
    </div>
  )
}
