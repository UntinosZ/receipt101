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
import { checkMigrationStatus, getMigrationInstructions } from "@/lib/migration-checker"
import ReceiptPreview from "@/components/receipt-preview"
import TemplateSelector from "@/components/template-selector"
import QRCodeGenerator from "@/components/qr-code-generator"
import MenuSelector from "@/components/menu-selector"

interface ReceiptCreatorProps {
  onEditTemplate?: (template: Template) => void
  editingReceipt?: Receipt | null
  onReceiptUpdated?: () => void
}

export default function ReceiptCreator({ onEditTemplate, editingReceipt, onReceiptUpdated }: ReceiptCreatorProps) {
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
  const [migrationChecked, setMigrationChecked] = useState(false)

  // Check migration status on component mount
  useEffect(() => {
    const checkMigration = async () => {
      console.log('🔍 Checking database migration status...')
      
      try {
        const status = await checkMigrationStatus()
        console.log('📊 Migration status:', status)
        
        if (status.migrationNeeded && status.missingColumns) {
          const instructions = await getMigrationInstructions()
          console.warn("⚠️  Database migration needed:", instructions)
          
          toast({
            title: "Database Setup Required",
            description: "Missing database columns detected. Check console for migration instructions.",
            variant: "destructive",
            duration: 10000, // Show longer for important message
          })
        } else {
          console.log('✅ Database migration status OK')
        }
      } catch (error) {
        console.error('❌ Migration check failed:', error)
        toast({
          title: "Database Check Failed",
          description: "Could not verify database setup. Save functionality may not work.",
          variant: "destructive",
        })
      }
      
      setMigrationChecked(true)
    }
    
    if (!migrationChecked) {
      checkMigration()
    }
  }, [migrationChecked])

  // Load editing receipt data when editing mode is enabled
  useEffect(() => {
    if (editingReceipt) {
      setReceiptData({
        customer_name: editingReceipt.customer_name || "",
        customer_email: editingReceipt.customer_email || "",
        customer_phone: editingReceipt.customer_phone || "",
        items: editingReceipt.items || [{ id: "1", description: "", quantity: 1, price: 0 }],
        notes: editingReceipt.notes || "",
        receipt_date: editingReceipt.receipt_date || new Date().toISOString().split("T")[0],
        receipt_time: editingReceipt.receipt_time || new Date().toTimeString().slice(0, 5),
        receipt_number: editingReceipt.receipt_number || `RCP-${Date.now()}`,
      })
      
      // Set the charges from the editing receipt
      setCharges({
        enableTax: editingReceipt.tax_amount > 0,
        taxRate: editingReceipt.tax_rate || 8.5,
        enableServiceCharge: editingReceipt.service_charge_amount > 0,
        serviceChargeRate: editingReceipt.service_charge_rate || 5.0,
        enableDiscount: false,
        discountAmount: 0,
        enableRounding: false,
        roundingAmount: 0,
      })
      
      // Set the template if available
      if (editingReceipt.template_id) {
        // You may want to fetch the template by ID here
        setSelectedTemplate(editingReceipt.template_id as any)
      }
    }
  }, [editingReceipt])

  // Apply template defaults when a template is selected
  useEffect(() => {
    if (selectedTemplate && !editingReceipt) {
      // Only apply defaults for new receipts, not when editing
      try {
        setCharges(prev => ({
          ...prev,
          enableTax: selectedTemplate.enable_tax_by_default || false,
          taxRate: selectedTemplate.default_tax_rate || 8.5,
          enableServiceCharge: selectedTemplate.enable_service_charge_by_default || false,
          serviceChargeRate: selectedTemplate.default_service_charge_rate || 5.0,
        }))
        
        // Show feedback if defaults were applied
        if (selectedTemplate.enable_tax_by_default || selectedTemplate.enable_service_charge_by_default) {
          toast({
            title: "Template Defaults Applied",
            description: `Default charges from "${selectedTemplate.name}" have been applied.`,
          })
        }
      } catch (error) {
        console.error("Error applying template defaults:", error)
        // Fallback to manual defaults if template has missing columns
        setCharges(prev => ({
          ...prev,
          enableTax: false,
          taxRate: 8.5,
          enableServiceCharge: false,
          serviceChargeRate: 5.0,
        }))
      }
    }
  }, [selectedTemplate, editingReceipt])

  // Calculate totals
  const subtotal = receiptData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const discountAmount = charges.enableDiscount ? charges.discountAmount : 0
  const afterDiscountAmount = Math.max(0, subtotal - discountAmount)
  const serviceChargeAmount = charges.enableServiceCharge ? (afterDiscountAmount * charges.serviceChargeRate / 100) : 0
  const beforeTaxAmount = afterDiscountAmount + serviceChargeAmount
  const taxAmount = charges.enableTax ? (beforeTaxAmount * charges.taxRate / 100) : 0
  const roundingAmount = charges.enableRounding ? charges.roundingAmount : 0
  const finalTotal = beforeTaxAmount + taxAmount + roundingAmount

  const addItem = () => {
    const newItem: ReceiptItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      price: 0
    }
    setReceiptData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const removeItem = (id: string) => {
    if (receiptData.items.length > 1) {
      setReceiptData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }))
    }
  }

  const updateItem = (id: string, field: keyof ReceiptItem, value: string | number) => {
    setReceiptData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }))
  }

  const addMenuItemToReceipt = (receiptItem: ReceiptItem) => {
    setReceiptData(prev => ({
      ...prev,
      items: [...prev.items, receiptItem]
    }))
  }

  const handleSaveReceipt = async () => {
    console.log('🔄 Starting receipt save process...')
    
    if (!selectedTemplate) {
      toast({
        title: "Template Required",
        description: "Please select a template before saving the receipt.",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!receiptData.receipt_number.trim()) {
      toast({
        title: "Receipt Number Required",
        description: "Please enter a receipt number.",
        variant: "destructive",
      })
      return
    }

    if (receiptData.items.length === 0 || receiptData.items.every(item => !item.description.trim())) {
      toast({
        title: "Items Required",
        description: "Please add at least one item with a description.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    
    try {
      // First, test the database connection
      console.log('🔌 Testing database connection...')
      const { data: connectionTest, error: connectionError } = await supabase
        .from('templates')
        .select('id')
        .limit(1)
      
      if (connectionError) {
        console.error('❌ Database connection failed:', connectionError)
        throw new Error(`Database connection failed: ${connectionError.message}`)
      }
      
      console.log('✅ Database connection successful')
      
      // Verify the template exists
      console.log('🔍 Verifying template exists...')
      const { data: templateCheck, error: templateError } = await supabase
        .from('templates')
        .select('id, name')
        .eq('id', selectedTemplate.id)
        .single()
      
      if (templateError) {
        console.error('❌ Template verification failed:', templateError)
        throw new Error(`Template verification failed: ${templateError.message}`)
      }
      
      if (!templateCheck) {
        throw new Error('Selected template not found in database')
      }
      
      console.log('✅ Template verified:', templateCheck.name)
      
      console.log('📝 Preparing receipt data...')
      const receiptToSave = {
        template_id: selectedTemplate.id,
        customer_name: receiptData.customer_name || null,
        customer_email: receiptData.customer_email || null,
        customer_phone: receiptData.customer_phone || null,
        items: receiptData.items.filter(item => item.description.trim() !== ''),
        notes: receiptData.notes || null,
        receipt_date: receiptData.receipt_date,
        receipt_time: receiptData.receipt_time,
        receipt_number: receiptData.receipt_number,
        subtotal: Number(subtotal.toFixed(2)),
        tax_rate: Number(charges.taxRate),
        tax_amount: Number(taxAmount.toFixed(2)),
        service_charge_rate: Number(charges.serviceChargeRate),
        service_charge_amount: Number(serviceChargeAmount.toFixed(2)),
        discount_amount: Number((charges.enableDiscount ? charges.discountAmount : 0).toFixed(2)),
        rounding_amount: Number((charges.enableRounding ? roundingAmount : 0).toFixed(2)),
        total: Number(finalTotal.toFixed(2)),
        is_public: false,
        created_at: new Date().toISOString()
      }

      console.log('💾 Saving receipt to database...', {
        receiptNumber: receiptToSave.receipt_number,
        templateId: receiptToSave.template_id,
        total: receiptToSave.total
      })

      let result
      if (editingReceipt) {
        // Update existing receipt
        result = await supabase
          .from('receipts')
          .update(receiptToSave)
          .eq('id', editingReceipt.id)
          .select()
          .single()
      } else {
        // Create new receipt
        result = await supabase
          .from('receipts')
          .insert([receiptToSave])
          .select()
          .single()
      }

      if (result.error) {
        console.error('❌ Database error:', result.error)
        throw result.error
      }

      console.log('✅ Receipt saved successfully:', result.data.id)
      setSavedReceipt(result.data)
      
      toast({
        title: editingReceipt ? "Receipt Updated" : "Receipt Saved",
        description: editingReceipt ? "Receipt has been updated successfully." : "Receipt has been saved successfully.",
      })

      // Download the receipt image
      console.log('📸 Initiating image download...')
      setTimeout(() => {
        downloadReceiptImage(result.data)
      }, 500)

      // If we were editing, call the callback to return to gallery
      if (editingReceipt && onReceiptUpdated) {
        setTimeout(() => {
          onReceiptUpdated()
        }, 1000)
      }

    } catch (error) {
      console.error("❌ Error saving receipt:", error)
      console.error("❌ Error type:", typeof error)
      console.error("❌ Error constructor:", error?.constructor?.name)
      
      // Try to extract more details from the error
      if (error && typeof error === 'object') {
        console.error("❌ Error keys:", Object.keys(error))
        console.error("❌ Error stringified:", JSON.stringify(error, null, 2))
        
        // Check for nested error properties
        if ('error' in error) {
          console.error("❌ Nested error:", error.error)
        }
        if ('message' in error) {
          console.error("❌ Error message:", error.message)
        }
        if ('details' in error) {
          console.error("❌ Error details:", error.details)
        }
        if ('hint' in error) {
          console.error("❌ Error hint:", error.hint)
        }
        if ('code' in error) {
          console.error("❌ Error code:", error.code)
        }
      }
      
      let errorMessage = "Failed to save receipt. Please try again."
      
      // Provide specific error messages for common issues
      if (error instanceof Error) {
        console.log('🔍 Error details:', error.message)
        
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          errorMessage = "Database migration required. Please run the migration SQL in your Supabase dashboard."
        } else if (error.message.includes('permission') || error.message.includes('denied')) {
          errorMessage = "Permission denied. Please check your database access."
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection and try again."
        } else if (error.message.includes('foreign key') || error.message.includes('template_id')) {
          errorMessage = "Template not found. Please select a valid template."
        } else if (error.message.includes('unique') || error.message.includes('duplicate')) {
          errorMessage = "Receipt number already exists. Please use a different receipt number."
        } else if (error.message) {
          errorMessage = `Save failed: ${error.message}`
        }
      } else if (error && typeof error === 'object') {
        // Handle Supabase errors which might not be Error instances
        const supabaseError = error as any
        if (supabaseError.message) {
          errorMessage = `Database error: ${supabaseError.message}`
        } else if (supabaseError.error && supabaseError.error.message) {
          errorMessage = `Database error: ${supabaseError.error.message}`
        } else if (supabaseError.details) {
          errorMessage = `Database error: ${supabaseError.details}`
        } else {
          errorMessage = `Unexpected error occurred. Check console for details.`
        }
      }
      
      toast({
        title: "Save Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const downloadReceiptImage = (receipt?: Receipt) => {
    console.log('📸 Starting receipt image download...')
    
    const receiptElement = document.getElementById("receipt-preview")
    if (!receiptElement) {
      console.error('❌ Receipt preview element not found')
      toast({
        title: "Download Error",
        description: "Receipt preview not found. Please ensure the receipt is visible and try again.",
        variant: "destructive",
      })
      return
    }

    console.log('✅ Receipt element found, generating image...')
    
    toast({
      title: "Generating Image",
      description: "Please wait while we generate your receipt image...",
    })

    // Dynamic import to avoid SSR issues
    import("html2canvas").then((html2canvas) => {
      console.log('📦 html2canvas loaded successfully')
      
      const canvas = html2canvas.default(receiptElement, {
        backgroundColor: selectedTemplate?.background_color || "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        width: receiptElement.scrollWidth,
        height: receiptElement.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      })
      
      canvas.then((canvas) => {
        console.log('🎨 Canvas generated successfully')
        
        try {
          canvas.toBlob((blob) => {
            if (blob) {
              console.log('💾 Blob created, initiating download...')
              
              const url = URL.createObjectURL(blob)
              const link = document.createElement("a")
              link.href = url
              link.download = `receipt-${receiptData.receipt_number || 'download'}.png`
              link.style.display = 'none'
              
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(url)
              
              console.log('✅ Download completed successfully')
              
              toast({
                title: "Download Complete",
                description: "Receipt image has been downloaded successfully.",
              })
            } else {
              console.error('❌ Failed to create blob')
              toast({
                title: "Download Error",
                description: "Failed to generate receipt image blob. Please try again.",
                variant: "destructive",
              })
            }
          }, "image/png", 0.95)
        } catch (blobError) {
          console.error('❌ Error creating blob:', blobError)
          toast({
            title: "Download Error",
            description: "Failed to process image data. Please try again.",
            variant: "destructive",
          })
        }
      })
      .catch((canvasError) => {
        console.error("❌ Error generating canvas:", canvasError)
        toast({
          title: "Download Error",
          description: "Failed to generate receipt image. Please check if the receipt is properly displayed and try again.",
          variant: "destructive",
        })
      })
    }).catch((importError) => {
      console.error("❌ Error loading html2canvas:", importError)
      toast({
        title: "Download Error",
        description: "Failed to load image generator. Please refresh the page and try again.",
        variant: "destructive",
      })
    })
  }

  const resetForm = () => {
    setSelectedTemplate(null)
    setReceiptData({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      items: [{ id: "1", description: "", quantity: 1, price: 0 }],
      notes: "",
      receipt_date: new Date().toISOString().split("T")[0],
      receipt_time: new Date().toTimeString().slice(0, 5),
      receipt_number: `RCP-${Date.now()}`,
    })
    setCharges({
      enableTax: false,
      taxRate: 8.5,
      enableServiceCharge: false,
      serviceChargeRate: 5.0,
      enableDiscount: false,
      discountAmount: 0,
      enableRounding: false,
      roundingAmount: 0,
    })
    setSavedReceipt(null)
    setShowQR(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReceiptIcon className="w-5 h-5" />
              {editingReceipt ? "Edit Receipt" : "Create Receipt"}
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
                    <Label>Receipt Date</Label>
                    <Input
                      id="receiptDate"
                      type="date"
                      value={receiptData.receipt_date}
                      onChange={(e) => setReceiptData((prev) => ({ ...prev, receipt_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Receipt Time</Label>
                    <Input
                      id="receiptTime"
                      type="time"
                      value={receiptData.receipt_time}
                      onChange={(e) => setReceiptData((prev) => ({ ...prev, receipt_time: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Receipt Number</Label>
                  <Input
                    id="receiptNumber"
                    value={receiptData.receipt_number}
                    onChange={(e) => setReceiptData((prev) => ({ ...prev, receipt_number: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Customer Name</Label>
                    <Input
                      id="customerName"
                      value={receiptData.customer_name}
                      onChange={(e) => setReceiptData((prev) => ({ ...prev, customer_name: e.target.value }))}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <Label>Customer Email</Label>
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
                  <Label>Customer Phone</Label>
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
                  Receipt Items
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
                      <Label>Item Description *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        placeholder="Enter item description"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Quantity</Label>
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
                <CardTitle>Charges & Adjustments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {/* Discount */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={charges.enableDiscount || false}
                      onCheckedChange={(checked) => setCharges((prev) => ({ ...prev, enableDiscount: checked }))}
                    />
                    <Label>Discount</Label>
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
                        placeholder="0.00"
                      />
                      <span className="text-sm">$</span>
                    </div>
                  )}

                  {/* Service Charge */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={charges.enableServiceCharge}
                      onCheckedChange={(checked) => setCharges((prev) => ({ ...prev, enableServiceCharge: checked }))}
                    />
                    <Label>Service Charge</Label>
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

                  {/* Tax */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={charges.enableTax}
                      onCheckedChange={(checked) => setCharges((prev) => ({ ...prev, enableTax: checked }))}
                    />
                    <Label>Tax</Label>
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

                  {/* Rounding */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={charges.enableRounding || false}
                      onCheckedChange={(checked) => setCharges((prev) => ({ ...prev, enableRounding: checked }))}
                    />
                    <Label>Rounding</Label>
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
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Totals Display */}
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
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={receiptData.notes}
                  onChange={(e) => setReceiptData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any additional notes or special instructions..."
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button onClick={handleSaveReceipt} disabled={saving} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : editingReceipt ? "Update & Download Receipt" : "Save & Download Receipt"}
              </Button>
              <Button onClick={() => setShowQR(true)} variant="outline" className="flex-1" disabled={!savedReceipt}>
                <QrCode className="w-4 h-4 mr-2" />
                Show QR Code
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Receipt Preview */}
      <div className="lg:sticky lg:top-4">
        {selectedTemplate ? (
          <ReceiptPreview
            template={selectedTemplate}
            receiptData={receiptData}
            subtotal={subtotal}
            serviceChargeAmount={serviceChargeAmount}
            discountAmount={discountAmount}
            taxAmount={taxAmount}
            roundingAmount={roundingAmount}
            finalTotal={finalTotal}
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

      {/* QR Code Modal */}
      {showQR && savedReceipt && (
        <QRCodeGenerator
          receiptData={savedReceipt}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  )
}
