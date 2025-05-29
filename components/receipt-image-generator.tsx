"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, ImageIcon } from "lucide-react"

interface ReceiptImageGeneratorProps {
  receiptData: any
  subtotal: number
  total: number
}

export default function ReceiptImageGenerator({ receiptData, subtotal, total }: ReceiptImageGeneratorProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const renderItemsCountRow = () => {
    const template = receiptData.customTemplate
    if (!template?.show_items_count) return null

    const itemsCount = receiptData.items.length
    const layout = template.items_count_layout_columns || 2
    
    // Get column widths
    const col1Width = template.items_count_column1_width || 50
    const col2Width = template.items_count_column2_width || 50
    const col3Width = template.items_count_column3_width || 0
    
    // Get positions
    const labelsPos = template.items_count_labels_position || 'column1'
    const valuesPos = template.items_count_values_position || 'column2'
    
    // Get alignments
    const labelsAlign = template.items_count_labels_alignment || 'left'
    const valuesAlign = template.items_count_values_alignment || 'right'
    
    if (layout === 2) {
      return (
        <div className="flex justify-between text-sm">
          <div 
            className={`text-${labelsAlign}`}
            style={{ width: `${col1Width}%` }}
          >
            {labelsPos === 'column1' ? 'Items:' : ''}
            {valuesPos === 'column1' ? itemsCount : ''}
          </div>
          <div 
            className={`text-${valuesAlign}`}
            style={{ width: `${col2Width}%` }}
          >
            {labelsPos === 'column2' ? 'Items:' : ''}
            {valuesPos === 'column2' ? itemsCount : ''}
          </div>
        </div>
      )
    } else {
      return (
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div 
            className={`text-${labelsAlign}`}
            style={{ width: `${col1Width}%` }}
          >
            {labelsPos === 'column1' ? 'Items:' : ''}
            {valuesPos === 'column1' ? itemsCount : ''}
          </div>
          <div 
            className={`text-${labelsAlign}`}
            style={{ width: `${col2Width}%` }}
          >
            {labelsPos === 'column2' ? 'Items:' : ''}
            {valuesPos === 'column2' ? itemsCount : ''}
          </div>
          <div 
            className={`text-${valuesAlign}`}
            style={{ width: `${col3Width}%` }}
          >
            {labelsPos === 'column3' ? 'Items:' : ''}
            {valuesPos === 'column3' ? itemsCount : ''}
          </div>
        </div>
      )
    }
  }

  const downloadAsImage = async (format: "png" | "jpg" = "png") => {
    if (!receiptRef.current) return

    try {
      const html2canvas = await import("html2canvas")
      const canvas = await html2canvas.default(receiptRef.current, {
        backgroundColor: receiptData.customTemplate?.backgroundColor || "#ffffff",
        scale: 3, // High quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: 400,
        height: receiptRef.current.scrollHeight,
      })

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `receipt-${receiptData.receiptNumber}.${format}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
          }
        },
        `image/${format}`,
        0.95,
      )
    } catch (error) {
      console.error("Error generating image:", error)
      alert("Error generating image. Please try again.")
    }
  }

  const styles = receiptData.customTemplate
    ? {
        backgroundColor: receiptData.customTemplate.backgroundColor,
        color: receiptData.customTemplate.textColor,
        fontFamily: receiptData.customTemplate.fontFamily,
        fontSize: `${receiptData.customTemplate.fontSize}px`,
        border: receiptData.customTemplate.showBorder ? `2px solid ${receiptData.customTemplate.borderColor}` : "none",
      }
    : {}

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Download Receipt Image
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={receiptRef} className="p-6 rounded-lg bg-white" style={styles}>
          {/* Business Header */}
          <div
            className={`mb-6 ${
              receiptData.customTemplate?.headerStyle === "center"
                ? "text-center"
                : receiptData.customTemplate?.headerStyle === "right"
                  ? "text-right"
                  : "text-left"
            }`}
          >
            {receiptData.customTemplate?.showLogo && receiptData.customTemplate?.logoUrl && (
              <div
                className={`mb-4 ${
                  receiptData.customTemplate.logoPosition === "center" ||
                  receiptData.customTemplate.headerStyle === "center"
                    ? "flex justify-center"
                    : receiptData.customTemplate.logoPosition === "right"
                      ? "flex justify-end"
                      : "flex justify-start"
                }`}
              >
                <img
                  src={receiptData.customTemplate.logoUrl || "/placeholder.svg"}
                  alt="Business Logo"
                  style={{
                    width: `${receiptData.customTemplate.logoSize}px`,
                    height: `${receiptData.customTemplate.logoSize}px`,
                  }}
                  className="object-contain"
                  crossOrigin="anonymous"
                />
              </div>
            )}
            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: receiptData.customTemplate?.accentColor || "#3b82f6" }}
            >
              {receiptData.businessName || "Your Business Name"}
            </h1>
            {receiptData.businessAddress && (
              <p className="text-sm opacity-80 whitespace-pre-line">{receiptData.businessAddress}</p>
            )}
            {receiptData.businessPhone && <p className="text-sm opacity-80">{receiptData.businessPhone}</p>}
          </div>

          <hr className="my-4" style={{ borderColor: receiptData.customTemplate?.borderColor || "#e5e7eb" }} />

          {/* Receipt Details */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="font-medium">Receipt #:</p>
              <p style={{ color: receiptData.customTemplate?.accentColor || "#3b82f6" }}>{receiptData.receiptNumber}</p>
            </div>
            <div>
              <p className="font-medium">Date:</p>
              <p style={{ color: receiptData.customTemplate?.accentColor || "#3b82f6" }}>{receiptData.date}</p>
            </div>
            {receiptData.customerName && (
              <div className="col-span-2">
                <p className="font-medium">Customer:</p>
                <p style={{ color: receiptData.customTemplate?.accentColor || "#3b82f6" }}>
                  {receiptData.customerName}
                </p>
                {receiptData.customerEmail && <p className="text-xs opacity-80">{receiptData.customerEmail}</p>}
              </div>
            )}
          </div>

          <hr className="my-4" style={{ borderColor: receiptData.customTemplate?.borderColor || "#e5e7eb" }} />

          {/* Items */}
          <div className="space-y-2 mb-4">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium opacity-60">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            {receiptData.items.map((item: any) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 text-sm">
                <div className="col-span-6">{item.description || "Item"}</div>
                <div className="col-span-2 text-center">{item.quantity}</div>
                <div className="col-span-2 text-right">${item.price.toFixed(2)}</div>
                <div className="col-span-2 text-right">${(item.quantity * item.price).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <hr className="my-4" style={{ borderColor: receiptData.customTemplate?.borderColor || "#e5e7eb" }} />

          {/* Items Count (if enabled and configured separately) */}
          {renderItemsCountRow() && (
            <>
              {renderItemsCountRow()}
              <hr className="my-4" style={{ borderColor: receiptData.customTemplate?.borderColor || "#e5e7eb" }} />
            </>
          )}

          {/* Totals */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {receiptData.tax > 0 && (
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${receiptData.tax.toFixed(2)}</span>
              </div>
            )}
            <div
              className="flex justify-between font-bold text-lg pt-2"
              style={{ borderTop: `1px solid ${receiptData.customTemplate?.borderColor || "#e5e7eb"}` }}
            >
              <span>Total:</span>
              <span style={{ color: receiptData.customTemplate?.accentColor || "#3b82f6" }}>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-xs opacity-60">Thank you for your business!</div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => downloadAsImage("png")} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download PNG
          </Button>
          <Button onClick={() => downloadAsImage("jpg")} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download JPG
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
