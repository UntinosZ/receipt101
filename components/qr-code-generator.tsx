"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Download, Share2, X, Smartphone } from "lucide-react"
import type { Receipt } from "@/lib/supabase"

interface QRCodeGeneratorProps {
  receiptData: Receipt
  onClose: () => void
}

export default function QRCodeGenerator({ receiptData, onClose }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [receiptImageUrl, setReceiptImageUrl] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    generateQRCode()
    generateReceiptImage()
  }, [receiptData])

  const generateQRCode = () => {
    // Create a data URL containing the receipt information
    const receiptUrl = `${window.location.origin}/receipt/${receiptData.id}?data=${encodeURIComponent(JSON.stringify(receiptData))}`

    // Generate QR code using a simple QR code API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(receiptUrl)}`
    setQrCodeUrl(qrUrl)
  }

  const generateReceiptImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size for high quality
    canvas.width = 800
    canvas.height = 1200

    // Draw receipt background
    ctx.fillStyle = receiptData.template?.background_color || "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Set text properties
    ctx.fillStyle = receiptData.template?.text_color || "#000000"
    ctx.textAlign = "center"

    let yPos = 60

    // Draw logo if available
    if (receiptData.template?.show_logo && receiptData.template?.logo_url) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const logoSize = (receiptData.template?.logo_size || 80) * 2 // Scale for high res
        const logoX = (canvas.width - logoSize) / 2
        ctx.drawImage(img, logoX, yPos, logoSize, logoSize)
        yPos += logoSize + 20
        continueDrawing()
      }
      img.src = receiptData.template.logo_url
    } else {
      continueDrawing()
    }

    function continueDrawing() {
      // Draw business name
      ctx.font = "bold 40px Arial"
      ctx.fillStyle = receiptData.template?.accent_color || "#3b82f6"
      ctx.fillText(receiptData.template?.business_name || "Business Name", canvas.width / 2, yPos)
      yPos += 60

      // Draw address and contact info
      ctx.font = "28px Arial"
      ctx.fillStyle = receiptData.template?.text_color || "#000000"
      if (receiptData.template?.business_address) {
        const addressLines = receiptData.template.business_address.split("\n")
        addressLines.forEach((line) => {
          ctx.fillText(line, canvas.width / 2, yPos)
          yPos += 35
        })
      }
      if (receiptData.template?.business_phone) {
        ctx.fillText(receiptData.template.business_phone, canvas.width / 2, yPos)
        yPos += 35
      }
      if (receiptData.template?.business_email) {
        ctx.fillText(receiptData.template.business_email, canvas.width / 2, yPos)
        yPos += 50
      }

      // Draw separator line
      ctx.strokeStyle = receiptData.template?.border_color || "#e5e7eb"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(50, yPos)
      ctx.lineTo(canvas.width - 50, yPos)
      ctx.stroke()
      yPos += 40

      // Draw receipt details
      ctx.textAlign = "left"
      ctx.font = "28px Arial"
      ctx.fillText(`Receipt #: ${receiptData.receipt_number}`, 50, yPos)
      ctx.fillText(`Date: ${receiptData.receipt_date}`, 400, yPos)
      yPos += 40

      if (receiptData.customer_name) {
        ctx.fillText(`Customer: ${receiptData.customer_name}`, 50, yPos)
        yPos += 50
      }

      // Draw separator line
      ctx.beginPath()
      ctx.moveTo(50, yPos)
      ctx.lineTo(canvas.width - 50, yPos)
      ctx.stroke()
      yPos += 40

      // Draw items header
      ctx.font = "24px Arial"
      ctx.fillStyle = "#6b7280"
      ctx.fillText("Item", 50, yPos)
      ctx.textAlign = "center"
      ctx.fillText("Qty", 450, yPos)
      ctx.textAlign = "right"
      ctx.fillText("Price", 600, yPos)
      ctx.fillText("Total", 750, yPos)
      yPos += 40

      // Draw items
      ctx.fillStyle = receiptData.template?.text_color || "#000000"
      ctx.font = "26px Arial"
      receiptData.items?.forEach((item: any) => {
        ctx.textAlign = "left"
        ctx.fillText(item.description || "Item", 50, yPos)
        ctx.textAlign = "center"
        ctx.fillText(item.quantity.toString(), 450, yPos)
        ctx.textAlign = "right"
        ctx.fillText(`$${item.price.toFixed(2)}`, 600, yPos)
        ctx.fillText(`$${(item.quantity * item.price).toFixed(2)}`, 750, yPos)
        yPos += 35
      })

      yPos += 20

      // Draw separator line
      ctx.strokeStyle = receiptData.template?.border_color || "#e5e7eb"
      ctx.beginPath()
      ctx.moveTo(50, yPos)
      ctx.lineTo(canvas.width - 50, yPos)
      ctx.stroke()
      yPos += 40

      // Draw totals
      ctx.font = "28px Arial"
      ctx.textAlign = "right"
      ctx.fillText(`Subtotal: $${receiptData.subtotal.toFixed(2)}`, 750, yPos)
      yPos += 35

      if (receiptData.service_charge_amount > 0) {
        ctx.fillText(
          `Service Charge (${receiptData.service_charge_rate}%): $${receiptData.service_charge_amount.toFixed(2)}`,
          750,
          yPos,
        )
        yPos += 35
      }

      if (receiptData.tax_amount > 0) {
        ctx.fillText(`Tax (${receiptData.tax_rate}%): $${receiptData.tax_amount.toFixed(2)}`, 750, yPos)
        yPos += 35
      }

      // Draw total
      ctx.font = "bold 32px Arial"
      ctx.fillStyle = receiptData.template?.accent_color || "#3b82f6"
      ctx.fillText(`Total: $${receiptData.total.toFixed(2)}`, 750, yPos)
      yPos += 60

      // Draw footer
      if (receiptData.template?.show_footer && receiptData.template?.footer_text) {
        ctx.font = "24px Arial"
        ctx.fillStyle = "#6b7280"
        ctx.textAlign = "center"
        ctx.fillText(receiptData.template.footer_text, canvas.width / 2, yPos)
      }

      // Convert canvas to blob URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          setReceiptImageUrl(url)
        }
      }, "image/png")
    }
  }

  const downloadQRCode = () => {
    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = `qr-code-${receiptData.receipt_number}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadReceiptImage = () => {
    if (receiptImageUrl) {
      const link = document.createElement("a")
      link.href = receiptImageUrl
      link.download = `receipt-${receiptData.receipt_number}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt QR Code - ${receiptData.receipt_number}`,
          text: "Scan this QR code to view the receipt",
          url: qrCodeUrl,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(qrCodeUrl)
      alert("QR code URL copied to clipboard!")
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Mobile Receipt Access
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* QR Code Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">QR Code</CardTitle>
              <p className="text-sm text-gray-600">Scan with mobile device to view receipt</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                {qrCodeUrl && (
                  <img
                    src={qrCodeUrl || "/placeholder.svg"}
                    alt="QR Code"
                    className="border rounded-lg"
                    width={200}
                    height={200}
                  />
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={downloadQRCode} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={shareQRCode} variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  Receipt #{receiptData.receipt_number}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Receipt Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Receipt Preview</CardTitle>
              <p className="text-sm text-gray-600">Mobile-optimized receipt image</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  className="border rounded-lg max-w-full h-auto"
                  style={{ maxHeight: "300px" }}
                />
              </div>

              <Button onClick={downloadReceiptImage} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Receipt Image
              </Button>

              <div className="text-xs text-gray-500 text-center">Perfect for mobile viewing and sharing</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            <p>✓ Cloud-stored receipts</p>
            <p>✓ High-quality QR code</p>
            <p>✓ Easy sharing options</p>
          </div>
          <Button onClick={onClose} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
