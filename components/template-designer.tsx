// @ts-nocheck
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Helper function to safely get column order
const getColumnOrder = (template: any): string[] => {
  if (Array.isArray(template.column_order)) {
    return template.column_order;
  }
  // Try to parse if it's a JSON string
  if (typeof template.column_order === 'string') {
    try {
      const parsed = JSON.parse(template.column_order);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // Silently fall back to default if parsing fails
    }
  }
  return ["description", "quantity", "price", "total"];
}
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Palette, Save, Eye, Building2, Globe, Type, Users, Table, GripVertical, Move, Calculator } from "lucide-react"
import { supabase, type Template } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface TemplateDesignerProps {
  editingTemplate?: Template
  onTemplateUpdated?: () => void
}

export default function TemplateDesigner({ editingTemplate, onTemplateUpdated }: TemplateDesignerProps) {
  const [template, setTemplate] = useState<Partial<Template>>(() => {
    if (editingTemplate) {
      return editingTemplate
    }
    return {
      name: "My Business Template",
      business_name: "",
      business_address: "",
      business_phone: "",
      business_email: "",
      business_website: "",
      logo_url: "",
      logo_size: 80,
      logo_position: "center",
      show_logo: false,
      background_color: "#ffffff",
      text_color: "#000000",
      accent_color: "#3b82f6",
      font_family: "sans-serif",
      font_size: 14,
      show_border: true,
      border_color: "#e5e7eb",
      header_style: "center",
      footer_text: "Thank you for your business!",
      show_footer: true,
      terms_conditions: "",
      show_terms: false,
      // Custom header defaults
      custom_header1: "",
      custom_header2: "",
      custom_header1_size: 16,
      custom_header2_size: 14,
      custom_header1_style: "normal",
      custom_header2_style: "normal",
      show_custom_headers: false,
      // Customer block defaults
      show_customer_block: true,
      customer_block_title: "",
      customer_block_title_size: 16,
      customer_block_title_style: "bold",
      customer_block_text_size: 14,
      customer_block_text_style: "normal",
      customer_block_alignment: "left",
      customer_block_text: "",
      show_datetime_in_customer: true,
      datetime_format: "combined",
      datetime_style: "normal",
      datetime_size: 14,
      // Custom header alignment
      custom_header_alignment: "left",
      // Custom section defaults
      show_custom_section: false,
      custom_section_title: "Additional Information",
      custom_section_text: "",
      custom_section_title_size: 16,
      custom_section_text_size: 14,
      custom_section_title_style: "bold",
      custom_section_text_style: "normal",
      custom_section_alignment: "left",
      // Item table defaults
      show_item_labels: true,
      item_description_width: 50,
      item_quantity_width: 15,
      item_price_width: 17.5,
      item_total_width: 17.5,
      show_currency_symbol: false,
      // Column visibility defaults
      show_description_column: true,
      show_quantity_column: true,
      show_price_column: true,
      show_total_column: true,
      column_order: ["description", "quantity", "price", "total"],
      // Summary section defaults
      summary_layout_columns: 2,
      summary_column1_width: 50,
      summary_column2_width: 50,
      summary_column3_width: 0,
      summary_labels_alignment: "left",
      summary_values_alignment: "right",
      summary_labels_position: "column1",
      summary_values_position: "column2",
      // Items count section defaults (separate from summary)
      show_items_count: true,
      items_count_layout_columns: 2,
      items_count_column1_width: 50,
      items_count_column2_width: 50,
      items_count_column3_width: 0,
      items_count_labels_alignment: "left",
      items_count_values_alignment: "right",
      items_count_labels_position: "column1",
      items_count_values_position: "column2",
      // Default charge settings
      default_tax_rate: 8.5,
      default_service_charge_rate: 5.0,
      enable_tax_by_default: false,
      enable_service_charge_by_default: false,
      is_public: false,
    }
  })

  const [previewMode, setPreviewMode] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSaveTemplate = async () => {
    if (!template.name || !template.business_name) {
      toast({
        title: "Missing Information",
        description: "Please fill in template name and business name",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const templateData = {
        ...template,
        updated_at: new Date().toISOString(),
      }

      if (editingTemplate) {
        const { error } = await supabase.from("templates").update(templateData).eq("id", editingTemplate.id)

        if (error) throw error
        toast({
          title: "Success",
          description: "Template updated successfully!",
        })
      } else {
        const { error } = await supabase.from("templates").insert([templateData])

        if (error) throw error
        toast({
          title: "Success",
          description: "Template created successfully!",
        })
      }

      onTemplateUpdated?.()
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string
        setTemplate((prev) => ({ ...prev, logo_url: logoUrl, show_logo: true }))
      }
      reader.readAsDataURL(file)
    }
  }

  const sampleReceipt = {
    receiptNumber: "RCP-001",
    date: "2024-01-15",
    time: "14:30",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "(555) 123-4567",
    items: [
      { id: "1", description: "Sample Product", quantity: 2, price: 25.0 },
      { id: "2", description: "Service Fee", quantity: 1, price: 15.0 },
    ],
    subtotal: 65.0,
    taxRate: template.default_tax_rate || 8.5,
    taxAmount: template.enable_tax_by_default ? (65.0 * (template.default_tax_rate || 8.5)) / 100 : 0,
    serviceChargeRate: template.default_service_charge_rate || 5.0,
    serviceChargeAmount: template.enable_service_charge_by_default ? (65.0 * (template.default_service_charge_rate || 5.0)) / 100 : 0,
    get total() {
      const afterServiceCharge = this.subtotal + this.serviceChargeAmount;
      return afterServiceCharge + this.taxAmount;
    }
  }

  // Helper function to render summary row with configurable layout
  const renderSummaryRow = (label: string, value: string, isTotal = false) => {
    const layoutColumns = template.summary_layout_columns || 2;
    const labelsPosition = template.summary_labels_position || "column1";
    const valuesPosition = template.summary_values_position || "column2";
    const labelsAlignment = template.summary_labels_alignment || "left";
    const valuesAlignment = template.summary_values_alignment || "right";
    
    const columnWidths = {
      column1: template.summary_column1_width || 50,
      column2: template.summary_column2_width || 50,
      column3: template.summary_column3_width || 33.33
    };
    
    const getAlignmentClass = (alignment: string) => {
      switch (alignment) {
        case "center": return "text-center";
        case "right": return "text-right";
        default: return "text-left";
      }
    };
    
    const columns = [];
    
    // Create columns based on layout
    for (let i = 1; i <= layoutColumns; i++) {
      const columnKey = `column${i}` as keyof typeof columnWidths;
      const width = columnWidths[columnKey];
      
      let content = "";
      let alignment = "text-left";
      
      if (columnKey === labelsPosition) {
        content = label;
        alignment = getAlignmentClass(labelsAlignment);
      } else if (columnKey === valuesPosition) {
        content = value;
        alignment = getAlignmentClass(valuesAlignment);
      }
      
      columns.push(
        <div 
          key={columnKey}
          style={{ width: `${width}%` }} 
          className={`${alignment} ${isTotal ? "font-bold text-lg" : ""}`}
        >
          {content}
        </div>
      );
    }
    
    return (
      <div className={`flex gap-2 ${isTotal ? "pt-2 border-t-2 border-double" : ""}`} 
           style={isTotal ? { borderColor: template.border_color || "#e5e7eb" } : {}}>
        {columns}
      </div>
    );
  };

  // Helper function to render items count row with separate configurable layout
  const renderItemsCountRow = (label: string, value: string) => {
    const layoutColumns = template.items_count_layout_columns || 2;
    const labelsPosition = template.items_count_labels_position || "column1";
    const valuesPosition = template.items_count_values_position || "column2";
    const labelsAlignment = template.items_count_labels_alignment || "left";
    const valuesAlignment = template.items_count_values_alignment || "right";
    
    const columnWidths = {
      column1: template.items_count_column1_width || 50,
      column2: template.items_count_column2_width || 50,
      column3: template.items_count_column3_width || 33.33
    };
    
    const getAlignmentClass = (alignment: string) => {
      switch (alignment) {
        case "center": return "text-center";
        case "right": return "text-right";
        default: return "text-left";
      }
    };
    
    const columns = [];
    
    // Create columns based on layout
    for (let i = 1; i <= layoutColumns; i++) {
      const columnKey = `column${i}` as keyof typeof columnWidths;
      const width = columnWidths[columnKey];
      
      let content = "";
      let alignment = "text-left";
      
      if (columnKey === labelsPosition) {
        content = label;
        alignment = getAlignmentClass(labelsAlignment);
      } else if (columnKey === valuesPosition) {
        content = value;
        alignment = getAlignmentClass(valuesAlignment);
      }
      
      columns.push(
        <div 
          key={columnKey}
          style={{ width: `${width}%` }} 
          className={`${alignment}`}
        >
          {content}
        </div>
      );
    }
    
    return (
      <div className="flex gap-2">
        {columns}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        {/* Template Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Template Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="templateName" className="text-sm font-medium leading-none">Template Name</label>
              <Input
                
                value={template.name || ""}
                onChange={(e) => setTemplate((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                
                checked={template.is_public || false}
                onCheckedChange={(checked) => setTemplate((prev) => ({ ...prev, is_public: checked }))}
              />
              <Label htmlFor="isPublic" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Make template public (others can use it)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="businessName" className="text-sm font-medium leading-none">Business Name *</label>
              <Input
                
                value={template.business_name || ""}
                onChange={(e) => setTemplate((prev) => ({ ...prev, business_name: e.target.value }))}
                placeholder="Your Business Name"
                required
              />
            </div>

            <div>
              <label htmlFor="businessAddress" className="text-sm font-medium leading-none">Business Address</label>
              <Textarea
                
                value={template.business_address || ""}
                onChange={(e) => setTemplate((prev) => ({ ...prev, business_address: e.target.value }))}
                placeholder="123 Main Street&#10;City, State 12345"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Item Table Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table className="w-5 h-5" />
              Item Table Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Table Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  
                  checked={template.show_item_labels ?? true}
                  onCheckedChange={(checked) => setTemplate((prev) => ({ ...prev, show_item_labels: checked }))}
                />
                <label htmlFor="showItemLabels" className="text-sm font-medium leading-none">Show Column Labels</label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  
                  checked={template.show_currency_symbol ?? false}
                  onCheckedChange={(checked) => setTemplate((prev) => ({ ...prev, show_currency_symbol: checked }))}
                />
                <label htmlFor="showCurrencySymbol" className="text-sm font-medium leading-none">Show Currency Symbol ($)</label>
              </div>
            </div>

            {/* Column Visibility */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Column Visibility</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    
                    checked={template.show_description_column ?? true}
                    onCheckedChange={(checked) => setTemplate((prev) => ({ ...prev, show_description_column: checked }))}
                  />
                  <label htmlFor="showDescriptionColumn" className="text-sm font-medium leading-none">Description</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    
                    checked={template.show_quantity_column ?? true}
                    onCheckedChange={(checked) => setTemplate((prev) => ({ ...prev, show_quantity_column: checked }))}
                  />
                  <label htmlFor="showQuantityColumn" className="text-sm font-medium leading-none">Quantity</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    
                    checked={template.show_price_column ?? true}
                    onCheckedChange={(checked) => setTemplate((prev) => ({ ...prev, show_price_column: checked }))}
                  />
                  <label htmlFor="showPriceColumn" className="text-sm font-medium leading-none">Price</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    
                    checked={template.show_total_column ?? true}
                    onCheckedChange={(checked) => setTemplate((prev) => ({ ...prev, show_total_column: checked }))}
                  />
                  <label htmlFor="showTotalColumn" className="text-sm font-medium leading-none">Total</label>
                </div>
              </div>
            </div>

            {/* Column Order */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Column Order</h4>
              <div className="space-y-2">
                {getColumnOrder(template).map((column, index) => {
                  const columnNames = {
                    description: "Description",
                    quantity: "Quantity", 
                    price: "Price",
                    total: "Total"
                  }
                  
                  return (
                    <div key={column} className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="flex-1 text-sm">{columnNames[column as keyof typeof columnNames]}</span>
                      <div className="flex space-x-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentOrder = getColumnOrder(template);
                            const newOrder = [...currentOrder]
                            if (index > 0) {
                              [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]]
                              setTemplate((prev) => ({ ...prev, column_order: newOrder }))
                            }
                          }}
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                        >
                          ↑
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentOrder = getColumnOrder(template);
                            const newOrder = [...currentOrder]
                            if (index < newOrder.length - 1) {
                              [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
                              setTemplate((prev) => ({ ...prev, column_order: newOrder }))
                            }
                          }}
                          disabled={index === getColumnOrder(template).length - 1}
                          className="h-6 w-6 p-0"
                        >
                          ↓
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Column Widths - only for visible columns */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Column Widths (%)</h4>
              <div className="grid grid-cols-2 gap-4">
                {template.show_description_column && (
                  <div>
                    <label htmlFor="descriptionWidth" className="text-sm font-medium leading-none">Description: {template.item_description_width || 50}%</label>
                    <Slider
                      
                      min={30}
                      max={70}
                      step={5}
                      value={[template.item_description_width || 50]}
                      onValueChange={(value) => setTemplate((prev) => ({ ...prev, item_description_width: value[0] }))}
                      
                    />
                  </div>
                )}
                
                {template.show_quantity_column && (
                  <div>
                    <label htmlFor="quantityWidth" className="text-sm font-medium leading-none">Quantity: {template.item_quantity_width || 15}%</label>
                    <Slider
                      
                      min={10}
                      max={25}
                      step={2.5}
                      value={[template.item_quantity_width || 15]}
                      onValueChange={(value) => setTemplate((prev) => ({ ...prev, item_quantity_width: value[0] }))}
                      
                    />
                  </div>
                )}
                
                {template.show_price_column && (
                  <div>
                    <label htmlFor="priceWidth" className="text-sm font-medium leading-none">Price: {template.item_price_width || 17.5}%</label>
                    <Slider
                      
                      min={10}
                      max={25}
                      step={2.5}
                      value={[template.item_price_width || 17.5]}
                      onValueChange={(value) => setTemplate((prev) => ({ ...prev, item_price_width: value[0] }))}
                      
                    />
                  </div>
                )}
                
                {template.show_total_column && (
                  <div>
                    <label htmlFor="totalWidth" className="text-sm font-medium leading-none">Total: {template.item_total_width || 17.5}%</label>
                    <Slider
                      
                      min={10}
                      max={25}
                      step={2.5}
                      value={[template.item_total_width || 17.5]}
                      onValueChange={(value) => setTemplate((prev) => ({ ...prev, item_total_width: value[0] }))}
                      
                    />
                  </div>
                )}
              </div>
              
              {/* Show total width calculation */}
              <p className="text-xs text-gray-500">
                Total width of visible columns:{" "}
                {(
                  (template.show_description_column ? (template.item_description_width || 50) : 0) +
                  (template.show_quantity_column ? (template.item_quantity_width || 15) : 0) +
                  (template.show_price_column ? (template.item_price_width || 17.5) : 0) +
                  (template.show_total_column ? (template.item_total_width || 17.5) : 0)
                ).toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Summary Layout Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Summary Layout Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Column Layout */}
            <div>
              <label className="text-sm font-medium leading-none">Layout Columns</label>
              <Select
                value={template.summary_layout_columns?.toString() || "2"}
                onValueChange={(value) => {
                  const columns = parseInt(value);
                  setTemplate((prev) => ({ 
                    ...prev, 
                    summary_layout_columns: columns,
                    // Reset column widths based on selected layout
                    summary_column1_width: columns === 2 ? 50 : 33.33,
                    summary_column2_width: columns === 2 ? 50 : 33.33,
                    summary_column3_width: columns === 2 ? 0 : 33.33
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Column Widths */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium leading-none">Column 1 Width: {template.summary_column1_width?.toFixed(1) || 50}%</label>
                <Slider
                  min={20}
                  max={80}
                  step={2.5}
                  value={[template.summary_column1_width || 50]}
                  onValueChange={(value) => setTemplate((prev) => ({ ...prev, summary_column1_width: value[0] }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium leading-none">Column 2 Width: {template.summary_column2_width?.toFixed(1) || 50}%</label>
                <Slider
                  min={20}
                  max={80}
                  step={2.5}
                  value={[template.summary_column2_width || 50]}
                  onValueChange={(value) => setTemplate((prev) => ({ ...prev, summary_column2_width: value[0] }))}
                />
              </div>
              
              {(template.summary_layout_columns || 2) === 3 && (
                <div>
                  <label className="text-sm font-medium leading-none">Column 3 Width: {template.summary_column3_width?.toFixed(1) || 33.33}%</label>
                  <Slider
                    min={20}
                    max={80}
                    step={2.5}
                    value={[template.summary_column3_width || 33.33]}
                    onValueChange={(value) => setTemplate((prev) => ({ ...prev, summary_column3_width: value[0] }))}
                  />
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Total width: {(
                  (template.summary_column1_width || 50) +
                  (template.summary_column2_width || 50) +
                  ((template.summary_layout_columns || 2) === 3 ? (template.summary_column3_width || 0) : 0)
                ).toFixed(1)}%
              </p>
            </div>

            {/* Label Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium leading-none">Labels Position</label>
                <Select
                  value={template.summary_labels_position || "column1"}
                  onValueChange={(value) => setTemplate((prev) => ({ ...prev, summary_labels_position: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="column1">Column 1</SelectItem>
                    <SelectItem value="column2">Column 2</SelectItem>
                    {(template.summary_layout_columns || 2) === 3 && (
                      <SelectItem value="column3">Column 3</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium leading-none">Values Position</label>
                <Select
                  value={template.summary_values_position || "column2"}
                  onValueChange={(value) => setTemplate((prev) => ({ ...prev, summary_values_position: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="column1">Column 1</SelectItem>
                    <SelectItem value="column2">Column 2</SelectItem>
                    {(template.summary_layout_columns || 2) === 3 && (
                      <SelectItem value="column3">Column 3</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Alignment Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium leading-none">Labels Alignment</label>
                <Select
                  value={template.summary_labels_alignment || "left"}
                  onValueChange={(value) => setTemplate((prev) => ({ ...prev, summary_labels_alignment: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium leading-none">Values Alignment</label>
                <Select
                  value={template.summary_values_alignment || "right"}
                  onValueChange={(value) => setTemplate((prev) => ({ ...prev, summary_values_alignment: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Count Layout Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Items Count Layout Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Show Items Count Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={template.show_items_count ?? true}
                onCheckedChange={(checked) => setTemplate((prev) => ({ ...prev, show_items_count: checked }))}
              />
              <label className="text-sm font-medium leading-none">Show Items Count Row</label>
            </div>

            {template.show_items_count && (
              <>
                {/* Column Layout */}
                <div>
                  <label className="text-sm font-medium leading-none">Layout Columns</label>
                  <Select
                    value={template.items_count_layout_columns?.toString() || "2"}
                    onValueChange={(value) => {
                      const columns = parseInt(value);
                      setTemplate((prev) => ({ 
                        ...prev, 
                        items_count_layout_columns: columns,
                        // Reset column widths based on selected layout
                        items_count_column1_width: columns === 2 ? 50 : 33.33,
                        items_count_column2_width: columns === 2 ? 50 : 33.33,
                        items_count_column3_width: columns === 2 ? 0 : 33.33
                      }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Column Widths */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium leading-none">Column 1 Width: {template.items_count_column1_width?.toFixed(1) || 50}%</label>
                    <Slider
                      min={20}
                      max={80}
                      step={2.5}
                      value={[template.items_count_column1_width || 50]}
                      onValueChange={(value) => setTemplate((prev) => ({ ...prev, items_count_column1_width: value[0] }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium leading-none">Column 2 Width: {template.items_count_column2_width?.toFixed(1) || 50}%</label>
                    <Slider
                      min={20}
                      max={80}
                      step={2.5}
                      value={[template.items_count_column2_width || 50]}
                      onValueChange={(value) => setTemplate((prev) => ({ ...prev, items_count_column2_width: value[0] }))}
                    />
                  </div>
                  
                  {(template.items_count_layout_columns || 2) === 3 && (
                    <div>
                      <label className="text-sm font-medium leading-none">Column 3 Width: {template.items_count_column3_width?.toFixed(1) || 33.33}%</label>
                      <Slider
                        min={20}
                        max={80}
                        step={2.5}
                        value={[template.items_count_column3_width || 33.33]}
                        onValueChange={(value) => setTemplate((prev) => ({ ...prev, items_count_column3_width: value[0] }))}
                      />
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Total width: {(
                      (template.items_count_column1_width || 50) +
                      (template.items_count_column2_width || 50) +
                      ((template.items_count_layout_columns || 2) === 3 ? (template.items_count_column3_width || 0) : 0)
                    ).toFixed(1)}%
                  </p>
                </div>

                {/* Label Configuration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium leading-none">Labels Position</label>
                    <Select
                      value={template.items_count_labels_position || "column1"}
                      onValueChange={(value) => setTemplate((prev) => ({ ...prev, items_count_labels_position: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="column1">Column 1</SelectItem>
                        <SelectItem value="column2">Column 2</SelectItem>
                        {(template.items_count_layout_columns || 2) === 3 && (
                          <SelectItem value="column3">Column 3</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium leading-none">Values Position</label>
                    <Select
                      value={template.items_count_values_position || "column2"}
                      onValueChange={(value) => setTemplate((prev) => ({ ...prev, items_count_values_position: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="column1">Column 1</SelectItem>
                        <SelectItem value="column2">Column 2</SelectItem>
                        {(template.items_count_layout_columns || 2) === 3 && (
                          <SelectItem value="column3">Column 3</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Alignment Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium leading-none">Labels Alignment</label>
                    <Select
                      value={template.items_count_labels_alignment || "left"}
                      onValueChange={(value) => setTemplate((prev) => ({ ...prev, items_count_labels_alignment: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium leading-none">Values Alignment</label>
                    <Select
                      value={template.items_count_values_alignment || "right"}
                      onValueChange={(value) => setTemplate((prev) => ({ ...prev, items_count_values_alignment: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Default Charges Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Default Charges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tax Settings */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">Tax Settings</h4>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={template.enable_tax_by_default || false}
                  onCheckedChange={(checked) => setTemplate((prev) => ({ ...prev, enable_tax_by_default: checked }))}
                />
                <label className="text-sm font-medium leading-none">Enable tax by default</label>
              </div>

              <div>
                <label className="text-sm font-medium leading-none">Default Tax Rate (%)</label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={template.default_tax_rate || 8.5}
                    onChange={(e) => setTemplate((prev) => ({ ...prev, default_tax_rate: parseFloat(e.target.value) || 0 }))}
                    placeholder="8.5"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground">
                    This tax rate will be automatically applied when creating receipts with this template
                  </p>
                </div>
              </div>
            </div>

            {/* Service Charge Settings */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">Service Charge Settings</h4>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={template.enable_service_charge_by_default || false}
                  onCheckedChange={(checked) => setTemplate((prev) => ({ ...prev, enable_service_charge_by_default: checked }))}
                />
                <label className="text-sm font-medium leading-none">Enable service charge by default</label>
              </div>

              <div>
                <label className="text-sm font-medium leading-none">Default Service Charge Rate (%)</label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={template.default_service_charge_rate || 5.0}
                    onChange={(e) => setTemplate((prev) => ({ ...prev, default_service_charge_rate: parseFloat(e.target.value) || 0 }))}
                    placeholder="5.0"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground">
                    This service charge rate will be automatically applied when creating receipts with this template
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Headers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Custom Headers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                
                checked={template.show_custom_headers || false}
                onCheckedChange={(checked) => setTemplate((prev) => ({ ...prev, show_custom_headers: checked }))}
              />
              <label htmlFor="showCustomHeaders" className="text-sm font-medium leading-none">Show Custom Headers</label>
            </div>

            {template.show_custom_headers && (
              <div className="space-y-6">
                {/* Header Alignment */}
                <div>
                  <label htmlFor="customHeaderAlignment" className="text-sm font-medium leading-none">Header Alignment</label>
                  <Select
                    value={template.custom_header_alignment || "left"}
                    onValueChange={(value) => setTemplate((prev) => ({ ...prev, custom_header_alignment: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Header 1 */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-medium">Custom Header 1</h4>
                  <div>
                    <label htmlFor="customHeader1" className="text-sm font-medium leading-none">Text</label>
                    <Textarea
                      
                      value={template.custom_header1 || ""}
                      onChange={(e) => setTemplate((prev) => ({ ...prev, custom_header1: e.target.value }))}
                      placeholder="Enter custom header text...&#10;You can use multiple lines"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">Use line breaks to separate text into multiple lines</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="customHeader1Size" className="text-sm font-medium leading-none">Size: {template.custom_header1_size}px</label>
                      <Slider
                        
                        min={10}
                        max={24}
                        step={1}
                        value={[template.custom_header1_size || 16]}
                        onValueChange={(value) => setTemplate((prev) => ({ ...prev, custom_header1_size: value[0] }))}
                        
                      />
                    </div>
                    <div>
                      <label htmlFor="customHeader1Style" className="text-sm font-medium leading-none">Style</label>
                      <Select
                        value={template.custom_header1_style || "normal"}
                        onValueChange={(value) => setTemplate((prev) => ({ ...prev, custom_header1_style: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="italic">Italic</SelectItem>
                          <SelectItem value="bold-italic">Bold Italic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Custom Header 2 */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-medium">Custom Header 2</h4>
                  <div>
                    <label htmlFor="customHeader2" className="text-sm font-medium leading-none">Text</label>
                    <Textarea
                      
                      value={template.custom_header2 || ""}
                      onChange={(e) => setTemplate((prev) => ({ ...prev, custom_header2: e.target.value }))}
                      placeholder="Enter custom header text...&#10;You can use multiple lines"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">Use line breaks to separate text into multiple lines</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="customHeader2Size" className="text-sm font-medium leading-none">Size: {template.custom_header2_size}px</label>
                      <Slider
                        
                        min={10}
                        max={24}
                        step={1}
                        value={[template.custom_header2_size || 14]}
                        onValueChange={(value) => setTemplate((prev) => ({ ...prev, custom_header2_size: value[0] }))}
                        
                      />
                    </div>
                    <div>
                      <label htmlFor="customHeader2Style" className="text-sm font-medium leading-none">Style</label>
                      <Select
                        value={template.custom_header2_style || "normal"}
                        onValueChange={(value) => setTemplate((prev) => ({ ...prev, custom_header2_style: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="italic">Italic</SelectItem>
                          <SelectItem value="bold-italic">Bold Italic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Block */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Customer Block
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                
                checked={template.show_customer_block || false}
                onCheckedChange={(checked) => setTemplate((prev) => ({ ...prev, show_customer_block: checked }))}
              />
              <label htmlFor="showCustomerBlock" className="text-sm font-medium leading-none">Show Customer Block</label>
            </div>

            {template.show_customer_block && (
              <div className="space-y-6">
                {/* Customer Block Alignment */}
                <div>
                  <label htmlFor="customerBlockAlignment" className="text-sm font-medium leading-none">Block Alignment</label>
                  <Select
                    value={template.customer_block_alignment || "left"}
                    onValueChange={(value) => setTemplate((prev) => ({ ...prev, customer_block_alignment: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Customer Block Title */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-medium">Block Title</h4>
                  <div>
                    <label htmlFor="customerBlockTitle" className="text-sm font-medium leading-none">Title Text</label>
                    <Input
                      
                      value={template.customer_block_title || ""}
                      onChange={(e) => setTemplate((prev) => ({ ...prev, customer_block_title: e.target.value }))}
                      placeholder="Customer Information"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="customerBlockTitleSize" className="text-sm font-medium leading-none">Size: {template.customer_block_title_size}px</label>
                      <Slider
                        
                        min={12}
                        max={20}
                        step={1}
                        value={[template.customer_block_title_size || 16]}
                        onValueChange={(value) =>
                          setTemplate((prev) => ({ ...prev, customer_block_title_size: value[0] }))
                        }
                        
                      />
                    </div>
                    <div>
                      <label htmlFor="customerBlockTitleStyle" className="text-sm font-medium leading-none">Style</label>
                      <Select
                        value={template.customer_block_title_style || "bold"}
                        onValueChange={(value) =>
                          setTemplate((prev) => ({ ...prev, customer_block_title_style: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="italic">Italic</SelectItem>
                          <SelectItem value="bold-italic">Bold Italic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Customer Block Content */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-medium">Customer Content</h4>
                  <div>
                    <label htmlFor="customerBlockText" className="text-sm font-medium leading-none">Customer Information</label>
                    <Textarea
                      
                      value={template.customer_block_text || ""}
                      onChange={(e) => setTemplate((prev) => ({ ...prev, customer_block_text: e.target.value }))}
                      placeholder="Enter customer information...&#10;Name: John Doe&#10;Email: john@example.com&#10;Phone: (555) 123-4567"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use line breaks to separate information into multiple lines
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="customerBlockTextSize" className="text-sm font-medium leading-none">Size: {template.customer_block_text_size}px</label>
                      <Slider
                        
                        min={10}
                        max={18}
                        step={1}
                        value={[template.customer_block_text_size || 14]}
                        onValueChange={(value) =>
                          setTemplate((prev) => ({ ...prev, customer_block_text_size: value[0] }))
                        }
                        
                      />
                    </div>
                    <div>
                      <label htmlFor="customerBlockTextStyle" className="text-sm font-medium leading-none">Style</label>
                      <Select
                        value={template.customer_block_text_style || "normal"}
                        onValueChange={(value) =>
                          setTemplate((prev) => ({ ...prev, customer_block_text_style: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="italic">Italic</SelectItem>
                          <SelectItem value="bold-italic">Bold Italic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Date & Time Settings */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Switch
                      
                      checked={template.show_datetime_in_customer || false}
                      onCheckedChange={(checked) =>
                        setTemplate((prev) => ({ ...prev, show_datetime_in_customer: checked }))
                      }
                    />
                    <label htmlFor="showDatetimeInCustomer" className="text-sm font-medium leading-none">Show Date & Time in Customer Block</label>
                  </div>

                  {template.show_datetime_in_customer && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="datetimeFormat" className="text-sm font-medium leading-none">Date & Time Format</label>
                        <Select
                          value={template.datetime_format || "combined"}
                          onValueChange={(value) => setTemplate((prev) => ({ ...prev, datetime_format: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="combined">Combined (Date & Time)</SelectItem>
                            <SelectItem value="separate">Separate (Date Left, Time Right)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="datetimeSize" className="text-sm font-medium leading-none">Size: {template.datetime_size}px</label>
                          <Slider
                            
                            min={10}
                            max={18}
                            step={1}
                            value={[template.datetime_size || 14]}
                            onValueChange={(value) => setTemplate((prev) => ({ ...prev, datetime_size: value[0] }))}
                            
                          />
                        </div>
                        <div>
                          <label htmlFor="datetimeStyle" className="text-sm font-medium leading-none">Style</label>
                          <Select
                            value={template.datetime_style || "normal"}
                            onValueChange={(value) => setTemplate((prev) => ({ ...prev, datetime_style: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="bold">Bold</SelectItem>
                              <SelectItem value="italic">Italic</SelectItem>
                              <SelectItem value="bold-italic">Bold Italic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Custom Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Custom Section
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                
                checked={template.show_custom_section || false}
                onCheckedChange={(checked) => setTemplate((prev) => ({ ...prev, show_custom_section: checked }))}
              />
              <label htmlFor="showCustomSection" className="text-sm font-medium leading-none">Show Custom Section (Before Footer)</label>
            </div>

            {template.show_custom_section && (
              <div className="space-y-6">
                {/* Section Alignment */}
                <div>
                  <label htmlFor="customSectionAlignment" className="text-sm font-medium leading-none">Section Alignment</label>
                  <Select
                    value={template.custom_section_alignment || "left"}
                    onValueChange={(value) => setTemplate((prev) => ({ ...prev, custom_section_alignment: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Section Title */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-medium">Section Title</h4>
                  <div>
                    <label htmlFor="customSectionTitle" className="text-sm font-medium leading-none">Title Text</label>
                    <Input
                      
                      value={template.custom_section_title || ""}
                      onChange={(e) => setTemplate((prev) => ({ ...prev, custom_section_title: e.target.value }))}
                      placeholder="Additional Information"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="customSectionTitleSize" className="text-sm font-medium leading-none">Size: {template.custom_section_title_size}px</label>
                      <Slider
                        
                        min={12}
                        max={20}
                        step={1}
                        value={[template.custom_section_title_size || 16]}
                        onValueChange={(value) =>
                          setTemplate((prev) => ({ ...prev, custom_section_title_size: value[0] }))
                        }
                        
                      />
                    </div>
                    <div>
                      <label htmlFor="customSectionTitleStyle" className="text-sm font-medium leading-none">Style</label>
                      <Select
                        value={template.custom_section_title_style || "bold"}
                        onValueChange={(value) =>
                          setTemplate((prev) => ({ ...prev, custom_section_title_style: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="italic">Italic</SelectItem>
                          <SelectItem value="bold-italic">Bold Italic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Section Content */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-medium">Section Content</h4>
                  <div>
                    <label htmlFor="customSectionText" className="text-sm font-medium leading-none">Content Text</label>
                    <Textarea
                      
                      value={template.custom_section_text || ""}
                      onChange={(e) => setTemplate((prev) => ({ ...prev, custom_section_text: e.target.value }))}
                      placeholder="Enter your custom content here...&#10;You can use multiple lines"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">Use line breaks to separate text into multiple lines</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="customSectionTextSize" className="text-sm font-medium leading-none">Size: {template.custom_section_text_size}px</label>
                      <Slider
                        
                        min={10}
                        max={18}
                        step={1}
                        value={[template.custom_section_text_size || 14]}
                        onValueChange={(value) =>
                          setTemplate((prev) => ({ ...prev, custom_section_text_size: value[0] }))
                        }
                        
                      />
                    </div>
                    <div>
                      <label htmlFor="customSectionTextStyle" className="text-sm font-medium leading-none">Style</label>
                      <Select
                        value={template.custom_section_text_style || "normal"}
                        onValueChange={(value) =>
                          setTemplate((prev) => ({ ...prev, custom_section_text_style: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="italic">Italic</SelectItem>
                          <SelectItem value="bold-italic">Bold Italic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Footer Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                
                checked={template.show_footer || false}
                onCheckedChange={(checked) => setTemplate((prev) => ({ ...prev, show_footer: checked }))}
              />
              <label htmlFor="showFooter" className="text-sm font-medium leading-none">Show Footer</label>
            </div>

            {template.show_footer && (
              <div>
                <label htmlFor="footerText" className="text-sm font-medium leading-none">Footer Text</label>
                <Textarea
                  
                  value={template.footer_text || ""}
                  onChange={(e) => setTemplate((prev) => ({ ...prev, footer_text: e.target.value }))}
                  placeholder="Thank you for your business!&#10;Visit us again soon!&#10;Follow us on social media"
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Use line breaks to separate text into multiple lines</p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                
                checked={template.show_terms || false}
                onCheckedChange={(checked) => setTemplate((prev) => ({ ...prev, show_terms: checked }))}
              />
              <label htmlFor="showTerms" className="text-sm font-medium leading-none">Show Terms & Conditions</label>
            </div>

            {template.show_terms && (
              <div>
                <label htmlFor="termsConditions" className="text-sm font-medium leading-none">Terms & Conditions</label>
                <Textarea
                  
                  value={template.terms_conditions || ""}
                  onChange={(e) => setTemplate((prev) => ({ ...prev, terms_conditions: e.target.value }))}
                  placeholder="Enter your terms and conditions..."
                  rows={4}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleSaveTemplate} disabled={saving} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : editingTemplate ? "Update Template" : "Save Template"}
          </Button>
          <Button onClick={() => setPreviewMode(!previewMode)} variant="outline" className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      <div className="lg:sticky lg:top-4">
        <Card>
          <CardHeader>
            <CardTitle>Template Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="p-6 rounded-lg max-w-md mx-auto"
              style={{
                backgroundColor: template.background_color,
                color: template.text_color,
                fontFamily: template.font_family,
                fontSize: `${template.font_size}px`,
                border: template.show_border ? `2px solid ${template.border_color}` : "none",
              }}
            >
              {/* Business Header */}
              <div
                className={`mb-6 ${template.header_style === "center" ? "text-center" : template.header_style === "right" ? "text-right" : "text-left"}`}
              >
                {template.show_logo && template.logo_url && (
                  <div
                    className={`mb-4 ${template.logo_position === "center" || template.header_style === "center" ? "flex justify-center" : template.logo_position === "right" ? "flex justify-end" : "flex justify-start"}`}
                  >
                    <img
                      src={template.logo_url || "/placeholder.svg"}
                      alt="Business Logo"
                      style={{ width: `${template.logo_size}px`, height: `${template.logo_size}px` }}
                      className="object-contain"
                    />
                  </div>
                )}
                <h1 className="text-2xl font-bold mb-2" style={{ color: template.accent_color }}>
                  {template.business_name || "Business Name"}
                </h1>
                {template.business_address && (
                  <p className="text-sm opacity-80 whitespace-pre-line">{template.business_address}</p>
                )}
              </div>

              {/* Custom Headers */}
              {template.show_custom_headers && (template.custom_header1 || template.custom_header2) && (
                <div className="mb-4">
                  <div
                    className={`${
                      template.custom_header_alignment === "center"
                        ? "text-center"
                        : template.custom_header_alignment === "right"
                          ? "text-right"
                          : "text-left"
                    }`}
                  >
                    {template.custom_header1 && (
                      <p
                        className={`mb-1 ${template.custom_header1_style === "bold" ? "font-bold" : ""} ${template.custom_header1_style === "italic" ? "italic" : ""} ${template.custom_header1_style === "bold-italic" ? "font-bold italic" : ""} whitespace-pre-line`}
                        style={{ fontSize: `${template.custom_header1_size}px` }}
                      >
                        {template.custom_header1}
                      </p>
                    )}
                    {template.custom_header2 && (
                      <p
                        className={`mb-1 ${template.custom_header2_style === "bold" ? "font-bold" : ""} ${template.custom_header2_style === "italic" ? "italic" : ""} ${template.custom_header2_style === "bold-italic" ? "font-bold italic" : ""} whitespace-pre-line`}
                        style={{ fontSize: `${template.custom_header2_size}px` }}
                      >
                        {template.custom_header2}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <hr className="my-4" style={{ borderColor: template.border_color }} />

              {template.show_customer_block && template.customer_block_text && (
                <div className="mb-4">
                  <div
                    className={`${
                      template.customer_block_alignment === "center"
                        ? "text-center"
                        : template.customer_block_alignment === "right"
                          ? "text-right"
                          : "text-left"
                    }`}
                  >
                    {template.customer_block_title && (
                      <h3
                        className={`mb-2 ${template.customer_block_title_style === "bold" ? "font-bold" : ""} ${template.customer_block_title_style === "italic" ? "italic" : ""} ${template.customer_block_title_style === "bold-italic" ? "font-bold italic" : ""}`}
                        style={{ fontSize: `${template.customer_block_title_size}px` }}
                      >
                        {template.customer_block_title}
                      </h3>
                    )}
                    <div
                      className={`${template.customer_block_text_style === "bold" ? "font-bold" : ""} ${template.customer_block_text_style === "italic" ? "italic" : ""} ${template.customer_block_text_style === "bold-italic" ? "font-bold italic" : ""} whitespace-pre-line`}
                      style={{ fontSize: `${template.customer_block_text_size}px` }}
                    >
                      {template.customer_block_text}
                    </div>
                    {template.show_datetime_in_customer && (
                      <div
                        className={`mt-2 pt-2 border-t ${template.datetime_style === "bold" ? "font-bold" : ""} ${template.datetime_style === "italic" ? "italic" : ""} ${template.datetime_style === "bold-italic" ? "font-bold italic" : ""}`}
                        style={{
                          fontSize: `${template.datetime_size}px`,
                          borderColor: template.border_color || "#e5e7eb",
                        }}
                      >
                        {template.datetime_format === "combined" ? (
                          <p>
                            Date & Time: {sampleReceipt.date} {sampleReceipt.time}
                          </p>
                        ) : (
                          <div className="flex justify-between">
                            <span>Date: {sampleReceipt.date}</span>
                            <span>Time: {sampleReceipt.time}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="space-y-2 mb-4">
                {(template.show_item_labels ?? true) && (
                  <div className="flex gap-2 text-xs font-medium opacity-60">
                    {getColumnOrder(template).map((column) => {
                      const columnConfig = {
                        description: {
                          label: "Item",
                          visible: template.show_description_column ?? true,
                          width: template.item_description_width || 50,
                          align: ""
                        },
                        quantity: {
                          label: "Qty", 
                          visible: template.show_quantity_column ?? true,
                          width: template.item_quantity_width || 15,
                          align: "text-center"
                        },
                        price: {
                          label: "Price",
                          visible: template.show_price_column ?? true,
                          width: template.item_price_width || 17.5,
                          align: "text-right"
                        },
                        total: {
                          label: "Total",
                          visible: template.show_total_column ?? true,
                          width: template.item_total_width || 17.5,
                          align: "text-right"
                        }
                      }
                      
                      const config = columnConfig[column as keyof typeof columnConfig]
                      
                      if (!config?.visible) return null
                      
                      return (
                        <div 
                          key={column}
                          style={{ width: `${config.width}%` }} 
                          className={config.align}
                        >
                          {config.label}
                        </div>
                      )
                    })}
                  </div>
                )}
                {sampleReceipt.items.map((item) => (
                  <div key={item.id} className="flex gap-2 text-sm">
                    {getColumnOrder(template).map((column) => {
                      const columnConfig = {
                        description: {
                          visible: template.show_description_column ?? true,
                          width: template.item_description_width || 50,
                          align: "",
                          content: item.description || "Item"
                        },
                        quantity: {
                          visible: template.show_quantity_column ?? true,
                          width: template.item_quantity_width || 15,
                          align: "text-center",
                          content: item.quantity.toString()
                        },
                        price: {
                          visible: template.show_price_column ?? true,
                          width: template.item_price_width || 17.5,
                          align: "text-right",
                          content: template.show_currency_symbol ? `$${item.price.toFixed(2)}` : item.price.toFixed(2)
                        },
                        total: {
                          visible: template.show_total_column ?? true,
                          width: template.item_total_width || 17.5,
                          align: "text-right",
                          content: template.show_currency_symbol
                            ? `$${(item.quantity * item.price).toFixed(2)}`
                            : (item.quantity * item.price).toFixed(2)
                        }
                      }
                      
                      const config = columnConfig[column as keyof typeof columnConfig]
                      
                      if (!config?.visible) return null
                      
                      return (
                        <div 
                          key={column}
                          style={{ width: `${config.width}%` }} 
                          className={config.align}
                        >
                          {config.content}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>

              <hr className="my-4" style={{ borderColor: template.border_color }} />

              {/* Totals - New Configurable Layout */}                <div className="space-y-1 text-sm">
                {(template.show_items_count ?? true) && renderItemsCountRow(
                  "Items:",
                  `${sampleReceipt.items.length}`
                )}
                {renderSummaryRow(
                  "Subtotal:",
                  template.show_currency_symbol
                    ? `$${sampleReceipt.subtotal.toFixed(2)}`
                    : sampleReceipt.subtotal.toFixed(2)
                )}
                {template.enable_service_charge_by_default && sampleReceipt.serviceChargeAmount > 0 && renderSummaryRow(
                  `Service Charge (${sampleReceipt.serviceChargeRate}%):`,
                  template.show_currency_symbol
                    ? `$${sampleReceipt.serviceChargeAmount.toFixed(2)}`
                    : sampleReceipt.serviceChargeAmount.toFixed(2)
                )}
                {(template.enable_service_charge_by_default || template.enable_tax_by_default) && renderSummaryRow(
                  "Before Tax:",
                  template.show_currency_symbol
                    ? `$${(sampleReceipt.subtotal + sampleReceipt.serviceChargeAmount).toFixed(2)}`
                    : (sampleReceipt.subtotal + sampleReceipt.serviceChargeAmount).toFixed(2)
                )}
                {template.enable_tax_by_default && sampleReceipt.taxAmount > 0 && renderSummaryRow(
                  `Tax (${sampleReceipt.taxRate}%):`,
                  template.show_currency_symbol
                    ? `$${sampleReceipt.taxAmount.toFixed(2)}`
                    : sampleReceipt.taxAmount.toFixed(2)
                )}
                <div style={{ color: template.accent_color }}>
                  {renderSummaryRow(
                    "Total:",
                    template.show_currency_symbol
                      ? `$${sampleReceipt.total.toFixed(2)}`
                      : sampleReceipt.total.toFixed(2),
                    true
                  )}
                </div>
                <div
                  className="border-t-2 border-double"
                  style={{ borderColor: template.border_color || "#e5e7eb" }}
                ></div>
              </div>

              {/* Custom Section */}
              {template.show_custom_section && (template.custom_section_title || template.custom_section_text) && (
                <div className="mt-6">
                  <div
                    className={`${
                      template.custom_section_alignment === "center"
                        ? "text-center"
                        : template.custom_section_alignment === "right"
                          ? "text-right"
                          : "text-left"
                    }`}
                  >
                    {template.custom_section_title && (
                      <h3
                        className={`mb-2 ${template.custom_section_title_style === "bold" ? "font-bold" : ""} ${template.custom_section_title_style === "italic" ? "italic" : ""} ${template.custom_section_title_style === "bold-italic" ? "font-bold italic" : ""}`}
                        style={{ fontSize: `${template.custom_section_title_size}px` }}
                      >
                        {template.custom_section_title}
                      </h3>
                    )}
                    {template.custom_section_text && (
                      <div
                        className={`${template.custom_section_text_style === "bold" ? "font-bold" : ""} ${template.custom_section_text_style === "italic" ? "italic" : ""} ${template.custom_section_text_style === "bold-italic" ? "font-bold italic" : ""} whitespace-pre-line`}
                        style={{ fontSize: `${template.custom_section_text_size}px` }}
                      >
                        {template.custom_section_text}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              {template.show_footer && template.footer_text && (
                <div className="text-center mt-6 text-xs opacity-60 whitespace-pre-line">{template.footer_text}</div>
              )}

              {template.show_terms && template.terms_conditions && (
                <div className="mt-4 text-xs opacity-60">
                  <p className="font-medium mb-1">Terms & Conditions:</p>
                  <p className="whitespace-pre-line">{template.terms_conditions}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
