"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ReceiptViewPage() {
  const searchParams = useSearchParams()
  const [receiptData, setReceiptData] = useState<any>(null)

  useEffect(() => {
    const data = searchParams.get("data")
    if (data) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(data))
        setReceiptData(parsedData)
      } catch (error) {
        console.error("Error parsing receipt data:", error)
      }
    }
  }, [searchParams])

  const downloadReceipt = () => {
    if (receiptData) {
      const receiptJson = JSON.stringify(receiptData, null, 2)
      const blob = new Blob([receiptJson], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `receipt-${receiptData.receiptNumber}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const downloadReceiptImage = async () => {
    const receiptElement = document.querySelector(".receipt-container")
    if (!receiptElement) return

    try {
      const html2canvas = await import("html2canvas")
      const canvas = await html2canvas.default(receiptElement as HTMLElement, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      })

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `receipt-${receiptData.receiptNumber}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      }, "image/png")
    } catch (error) {
      console.error("Error generating image:", error)
      alert("Error generating image. Please try again.")
    }
  }

  if (!receiptData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Loading receipt...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Mobile Receipt</h1>
        </div>

        <Card className="w-full receipt-container">
          <CardContent className="p-6">
            {/* Business Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">{receiptData.businessName}</h1>
              {receiptData.businessAddress && (
                <p className="text-sm text-gray-600 whitespace-pre-line">{receiptData.businessAddress}</p>
              )}
              {receiptData.businessPhone && <p className="text-sm text-gray-600">{receiptData.businessPhone}</p>}
            </div>

            <hr className="my-4" />

            {/* Receipt Details */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="font-medium">Receipt #:</p>
                <p className="text-blue-600">{receiptData.receiptNumber}</p>
              </div>
              <div>
                <p className="font-medium">Date:</p>
                <p className="text-blue-600">{receiptData.date}</p>
              </div>
              {receiptData.customerName && (
                <div className="col-span-2">
                  <p className="font-medium">Customer:</p>
                  <p className="text-blue-600">{receiptData.customerName}</p>
                  {receiptData.customerEmail && <p className="text-xs text-gray-500">{receiptData.customerEmail}</p>}
                </div>
              )}
            </div>

            <hr className="my-4" />

            {/* Items */}
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600">
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              {receiptData.items?.map((item: any, index: number) => (
                <div key={index} className="grid grid-cols-12 gap-2 text-sm">
                  <div className="col-span-6">{item.description}</div>
                  <div className="col-span-2 text-center">{item.quantity}</div>
                  <div className="col-span-2 text-right">${item.price.toFixed(2)}</div>
                  <div className="col-span-2 text-right">${(item.quantity * item.price).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <hr className="my-4" />

            {/* Totals */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${receiptData.subtotal?.toFixed(2) || "0.00"}</span>
              </div>
              {receiptData.tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${receiptData.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span className="text-blue-600">${receiptData.total?.toFixed(2) || "0.00"}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 text-xs text-gray-500">Thank you for your business!</div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button onClick={downloadReceipt} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download JSON
          </Button>
          <Button onClick={downloadReceiptImage} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download Image
          </Button>
        </div>
      </div>
    </div>
  )
}
