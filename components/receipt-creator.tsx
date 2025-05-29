"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Download, QrCode, ReceiptIcon } from "lucide-react"
import { supabase, type Template, type Receipt, type ReceiptItem } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import ReceiptPreview from "@/components/receipt-preview"
import TemplateSelector from "@/components/template-selector"
import QRCodeGenerator from "@/components/qr-code-generator"
import MenuSelector from "@/components/menu-selector"

interface ReceiptCreatorProps {
  onEditTemplate?: (template: Template) => void
}

export default function ReceiptCreator({ onEditTemplate }: ReceiptCreatorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [receiptData, setReceiptData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    items: [{ id: "1", description: "", quantity: 1, price: 0 }] as ReceiptItem[],
    notes: "",
    receipt_date: new Date().toISOString().split("T")[0],
    receipt_time: new Date().toTimeString().slice(0, 5),
    receipt_number: `RCP-${Date.now()}`,
  })

  const [charges, setCharges] = useState({
    enableTax: false,
    taxRate: 8.5,
    enableServiceCharge: false,
    serviceChargeRate: 5.0,
    enableDiscount: false,
    discountAmount: 0,
    enableRounding: false,
    roundingAmount: 0,
  })

  const [saving, setSaving] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [savedReceipt, setSavedReceipt] = useState<Receipt | null>(null)

  // Apply template's default charge settings when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      setCharges(prev => ({
        ...prev,
        enableTax: selectedTemplate.enable_tax_by_default || false,
        taxRate: selectedTemplate.default_tax_rate || 8.5,
        enableServiceCharge: selectedTemplate.enable_service_charge_by_default || false,
        serviceChargeRate: selectedTemplate.default_service_charge_rate || 5.0,
      }))
    }
  }, [selectedTemplate])

  const addItem = () => {
    const newItem: ReceiptItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      price: 0,
    }
    setReceiptData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
  }

  const addMenuItemToReceipt = (item: ReceiptItem) => {
    setReceiptData((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }))
  }

  const removeItem = (id: string) => {
    setReceiptData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }))
  }

  const updateItem = (id: string, field: keyof ReceiptItem, value: string | number) => {
    setReceiptData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }))
  }

  // Calculate totals
  const subtotal = receiptData.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const discountAmount = charges.enableDiscount ? charges.discountAmount : 0
  const afterDiscountAmount = subtotal - discountAmount
  const serviceChargeAmount = charges.enableServiceCharge ? (afterDiscountAmount * charges.serviceChargeRate) / 100 : 0
  const beforeTaxAmount = afterDiscountAmount + serviceChargeAmount
  const taxAmount = charges.enableTax ? (beforeTaxAmount * charges.taxRate) / 100 : 0
  const roundingAmount = charges.enableRounding ? charges.roundingAmount : 0
  const finalTotal = beforeTaxAmount + taxAmount + roundingAmount

  const handleSaveReceipt = async () => {
    if (!selectedTemplate) {
      toast({
        title: "No Template Selected",
        description: "Please select a template first",
        variant: "destructive",
      })
      return
    }

    if (receiptData.items.some((item) => !item.description)) {
      toast({
        title: "Missing Item Information",
        description: "Please fill in all item descriptions",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const receiptToSave = {
        receipt_number: receiptData.receipt_number,
        template_id: selectedTemplate.id,
        customer_name: receiptData.customer_name || null,
        customer_email: receiptData.customer_email || null,
        customer_phone: receiptData.customer_phone || null,
        items: receiptData.items,
        subtotal: Number(subtotal.toFixed(2)),
        tax_rate: charges.enableTax ? charges.taxRate : 0,
        tax_amount: Number(taxAmount.toFixed(2)),
        service_charge_rate: charges.enableServiceCharge ? charges.serviceChargeRate : 0,
        service_charge_amount: Number(serviceChargeAmount.toFixed(2)),
        total: Number(finalTotal.toFixed(2)),
        receipt_date: receiptData.receipt_date,
        receipt_time: receiptData.receipt_time,
        notes: receiptData.notes || null,
        is_public: false,
      }

      const { data, error } = await supabase
        .from("receipts")
        .insert([receiptToSave])
        .select(`
          *,
          template:templates(*)
        `)
        .single()

      if (error) throw error

      setSavedReceipt(data)
      toast({
        title: "Success",
        description: "Receipt saved successfully!",
      })

      // Generate and download receipt image
      setTimeout(() => {
        downloadReceiptImage(data)
      }, 500)
    } catch (error) {
      console.error("Error saving receipt:", error)
      toast({
        title: "Error",
        description: "Failed to save receipt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const downloadReceiptImage = (receipt?: Receipt) => {
    const receiptElement = document.getElementById("receipt-preview")
    if (!receiptElement) return

    import("html2canvas").then((html2canvas) => {
      html2canvas
        .default(receiptElement, {
          backgroundColor: selectedTemplate?.background_color || "#ffffff",
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
        })
        .then((canvas) => {
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const link = document.createElement("a")
              link.href = url
              link.download = `receipt-${receiptData.receipt_number}.png`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(url)
            }
          }, "image/png")
        })
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReceiptIcon className="w-5 h-5" />
              Select Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TemplateSelector
              onSelectTemplate={setSelectedTemplate}
              onEditTemplate={onEditTemplate}
              selectedTemplate={selectedTemplate}
            />
          </CardContent>
        </Card>

        {selectedTemplate && (
          <>
            {/* Receipt Details */}
            <Card>
              <CardHeader>
                <CardTitle>Receipt Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="receiptDate">Receipt Date</Label>
                    <Input
                      id="receiptDate"
                      type="date"
                      value={receiptData.receipt_date}
                      onChange={(e) => setReceiptData((prev) => ({ ...prev, receipt_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="receiptTime">Receipt Time</Label>
                    <Input
                      id="receiptTime"
                      type="time"
                      value={receiptData.receipt_time}
                      onChange={(e) => setReceiptData((prev) => ({ ...prev, receipt_time: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="receiptNumber">Receipt Number</Label>
                  <Input
                    id="receiptNumber"
                    value={receiptData.receipt_number}
                    onChange={(e) => setReceiptData((prev) => ({ ...prev, receipt_number: e.target.value }))}
                    placeholder="RCP-001"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={receiptData.customer_name}
                      onChange={(e) => setReceiptData((prev) => ({ ...prev, customer_name: e.target.value }))}
                      placeholder="Customer Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">Customer Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={receiptData.customer_email}
                      onChange={(e) => setReceiptData((prev) => ({ ...prev, customer_email: e.target.value }))}
                      placeholder="customer@email.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="customerPhone">Customer Phone</Label>
                  <Input
                    id="customerPhone"
                    value={receiptData.customer_phone}
                    onChange={(e) => setReceiptData((prev) => ({ ...prev, customer_phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Items
                  <Button onClick={addItem} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {receiptData.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Label>Description *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        placeholder="Item description"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label>Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={receiptData.items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Menu Selector */}
            <MenuSelector
              selectedTemplate={selectedTemplate}
              onAddItem={addMenuItemToReceipt}
            />

            {/* Charges & Totals */}
            <Card>
              <CardHeader>
                <CardTitle>Charges & Totals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enableDiscount"
                        checked={charges.enableDiscount || false}
                        onCheckedChange={(checked) => setCharges((prev) => ({ ...prev, enableDiscount: checked }))}
                      />
                      <Label htmlFor="enableDiscount">Discount</Label>
                    </div>
                    {charges.enableDiscount && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={charges.discountAmount || 0}
                          onChange={(e) =>
                            setCharges((prev) => ({
                              ...prev,
                              discountAmount: Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="w-20"
                          placeholder="0.00"
                        />
                        <span className="text-sm">$</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enableServiceCharge"
                        checked={charges.enableServiceCharge}
                        onCheckedChange={(checked) => setCharges((prev) => ({ ...prev, enableServiceCharge: checked }))}
                      />
                      <Label htmlFor="enableServiceCharge">Service Charge</Label>
                    </div>
                    {charges.enableServiceCharge && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={charges.serviceChargeRate}
                          onChange={(e) =>
                            setCharges((prev) => ({
                              ...prev,
                              serviceChargeRate: Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="w-20"
                          placeholder="5.0"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enableTax"
                        checked={charges.enableTax}
                        onCheckedChange={(checked) => setCharges((prev) => ({ ...prev, enableTax: checked }))}
                      />
                      <Label htmlFor="enableTax">Tax</Label>
                    </div>
                    {charges.enableTax && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={charges.taxRate}
                          onChange={(e) =>
                            setCharges((prev) => ({ ...prev, taxRate: Number.parseFloat(e.target.value) || 0 }))
                          }
                          className="w-20"
                          placeholder="8.5"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enableRounding"
                        checked={charges.enableRounding || false}
                        onCheckedChange={(checked) => setCharges((prev) => ({ ...prev, enableRounding: checked }))}
                      />
                      <Label htmlFor="enableRounding">Rounding</Label>
                    </div>
                    {charges.enableRounding && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={charges.roundingAmount || 0}
                          onChange={(e) =>
                            setCharges((prev) => ({
                              ...prev,
                              roundingAmount: Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="w-20"
                          placeholder="0.00"
                        />
                        <span className="text-sm">$</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Items: {receiptData.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {charges.enableDiscount && charges.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-${charges.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {charges.enableServiceCharge && (
                    <div className="flex justify-between">
                      <span>Service Charge ({charges.serviceChargeRate}%):</span>
                      <span>${serviceChargeAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Before Tax:</span>
                    <span>${beforeTaxAmount.toFixed(2)}</span>
                  </div>
                  {charges.enableTax && (
                    <div className="flex justify-between">
                      <span>Tax ({charges.taxRate}%):</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {charges.enableRounding && charges.roundingAmount !== 0 && (
                    <div className="flex justify-between">
                      <span>Rounding:</span>
                      <span>
                        {charges.roundingAmount >= 0 ? "+" : ""}${charges.roundingAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="border-t-2 border-double border-gray-400 pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="border-t-2 border-double border-gray-400"></div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={receiptData.notes}
                  onChange={(e) => setReceiptData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any additional notes or special instructions..."
                  rows={3}
                />
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={handleSaveReceipt} disabled={saving} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save & Download Receipt"}
              </Button>
              <Button onClick={() => setShowQR(true)} variant="outline" className="flex-1" disabled={!savedReceipt}>
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="lg:sticky lg:top-4">
        {selectedTemplate ? (
          <ReceiptPreview
            template={selectedTemplate}
            receiptData={receiptData}
            subtotal={subtotal}
            serviceChargeAmount={serviceChargeAmount}
            taxAmount={taxAmount}
            total={finalTotal}
            charges={charges}
          />
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <ReceiptIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Select a template to start creating your receipt</p>
            </CardContent>
          </Card>
        )}
      </div>

      {showQR && savedReceipt && <QRCodeGenerator receiptData={savedReceipt} onClose={() => setShowQR(false)} />}
    </div>
  )
}
