"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Template, ReceiptItem } from "@/lib/supabase"

// Helper function to safely get column order
const getColumnOrder = (template: Template): string[] => {
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

interface ReceiptPreviewProps {
  template: Template
  receiptData: {
    customer_name: string
    customer_email: string
    customer_phone: string
    items: ReceiptItem[]
    notes: string
    receipt_date: string
    receipt_number: string
    receipt_time?: string
  }
  subtotal: number
  serviceChargeAmount: number
  discountAmount: number
  taxAmount: number
  roundingAmount: number
  finalTotal: number
}

export default function ReceiptPreview({
  template,
  receiptData,
  subtotal,
  serviceChargeAmount,
  discountAmount,
  taxAmount,
  roundingAmount,
  finalTotal,
}: ReceiptPreviewProps) {
  
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
      <div className="flex gap-2">
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

  // Helper function to render separator lines aligned to the right with appropriate width
  const renderTotalSeparator = (isDouble = false) => {
    const layoutColumns = template.summary_layout_columns || 2;
    const columnWidths = {
      column1: template.summary_column1_width || 50,
      column2: template.summary_column2_width || 50,
      column3: template.summary_column3_width || 33.33
    };
    
    // Calculate the width for columns 2+3 or just column 2 if only 2 columns
    let separatorWidth: number;
    if (layoutColumns === 2) {
      separatorWidth = columnWidths.column2;
    } else {
      separatorWidth = columnWidths.column2 + columnWidths.column3;
    }
    
    // Calculate the left margin to align to the right
    const leftMargin = 100 - separatorWidth;
    
    return (
      <hr 
        className={isDouble ? 'border-t-2 border-dashed' : 'border-t'}
        style={{ 
          width: `${separatorWidth}%`,
          marginLeft: `${leftMargin}%`,
          marginRight: 0,
          marginTop: '8px',
          marginBottom: '8px',
          borderColor: template.border_color || "#e5e7eb",
          borderWidth: isDouble ? '2px' : '1px',
          borderStyle: isDouble ? 'double' : 'dashed'
        }}
      />
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Receipt Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="p-6 rounded-lg"
          id="receipt-preview"
          style={{
            backgroundColor: template.background_color,
            color: template.text_color,
            fontSize: `${template.font_size}px`,
            fontFamily: template.font_family,
            border: template.show_border ? `2px dashed ${template.border_color}` : "none",
          }}
        >
          {/* Business Header */}
          <div
            className={`mb-6 ${
              template.header_style === "center"
                ? "text-center"
                : template.header_style === "right"
                  ? "text-right"
                  : "text-left"
            }`}
          >
            {template.show_logo && template.logo_url && (
              <div
                className={`mb-4 ${
                  template.logo_position === "center" || template.header_style === "center"
                    ? "flex justify-center"
                    : template.logo_position === "right"
                      ? "flex justify-end"
                      : "flex justify-start"
                }`}
              >
                <img
                  src={template.logo_url || "/placeholder.svg"}
                  alt="Business Logo"
                  style={{ width: `${template.logo_size}px`, height: `${template.logo_size}px` }}
                  className="object-contain"
                />
              </div>
            )}
            <h1 className="text-xl font-bold mb-2" style={{ color: template.accent_color }}>
              {template.business_name}
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

          {/* Customer Block */}
          {template.show_customer_block && template.customer_block_text && (
            <div className="mb-4 border-t" style={{ borderStyle: 'dashed' }}>
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
                    className={`${template.datetime_style === "bold" ? "font-bold" : ""} ${template.datetime_style === "italic" ? "italic" : ""} ${template.datetime_style === "bold-italic" ? "font-bold italic" : ""}`}
                    style={{
                      fontSize: `${template.datetime_size}px`,
                      borderColor: template.border_color || "#e5e7eb",
                    }}
                  >
                    {template.datetime_format === "combined" ? (
                      <p>
                        Date & Time: {receiptData.receipt_date} {receiptData.receipt_time}
                      </p>
                    ) : (
                      <div className="flex justify-between">
                        <span>Date: {receiptData.receipt_date}</span>
                        <span>Time: {receiptData.receipt_time}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="my-4 border-t border-gray-300" style={{ borderStyle: 'dashed' }}></div>

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
            {receiptData.items.map((item) => (
              <div key={item.id} className="flex gap-2 text-sm">
                {getColumnOrder(template).map((column) => {
                  const columnConfig = {
                    description: {
                      visible: template.show_description_column ?? true,
                      width: template.item_description_width || 50,
                      align: "",
                      content: item.description || ""
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
                      {config.content || (column === 'description' ? '' : config.content)}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="my-4 border-t border-gray-300" style={{ borderStyle: 'dashed' }}></div>

          {/* Totals - New Configurable Layout */}
          <div className="space-y-1 text-sm">
            {(template.show_items_count ?? true) && (
              <>
                {renderItemsCountRow(
                  `Items:`,
                  `${receiptData.items.length}`
                )}
                {template.show_separator_after_items_count && (
                  <div className="my-2">
                    {renderTotalSeparator()}
                  </div>
                )}
              </>
            )}
            
            {renderSummaryRow(
              "Subtotal:",
              template.show_currency_symbol ? `$${subtotal.toFixed(2)}` : subtotal.toFixed(2)
            )}
            {template.show_separator_after_subtotal && (
              <div className="my-2">
                {renderTotalSeparator()}
              </div>
            )}
            
            {discountAmount > 0 && 
              renderSummaryRow(
                "Discount:",
                "-" + (template.show_currency_symbol
                  ? `$${discountAmount.toFixed(2)}`
                  : discountAmount.toFixed(2))
              )
            }
            
            {serviceChargeAmount > 0 && (
              <>
                {renderSummaryRow(
                  "Service Charge:",
                  template.show_currency_symbol
                    ? `$${serviceChargeAmount.toFixed(2)}`
                    : serviceChargeAmount.toFixed(2)
                )}
                {template.show_separator_after_service_charge && (
                  <div className="my-2">
                    {renderTotalSeparator()}
                  </div>
                )}
              </>
            )}
            
            {renderSummaryRow(
              "Before Tax:",
              template.show_currency_symbol
                ? `$${(subtotal - discountAmount + serviceChargeAmount).toFixed(2)}`
                : (subtotal - discountAmount + serviceChargeAmount).toFixed(2)
            )}
            {template.show_separator_after_before_tax && (
              <div className="my-2">
                {renderTotalSeparator()}
              </div>
            )}
            
            {taxAmount > 0 && (
              <>
                {renderSummaryRow(
                  "Tax:",
                  template.show_currency_symbol ? `$${taxAmount.toFixed(2)}` : taxAmount.toFixed(2)
                )}
                {template.show_separator_after_tax && (
                  <div className="my-2">
                    {renderTotalSeparator()}
                  </div>
                )}
              </>
            )}
            
            {roundingAmount !== 0 && 
              renderSummaryRow(
                "Rounding:",
                (roundingAmount >= 0 ? "+" : "") +
                (template.show_currency_symbol
                  ? `$${roundingAmount.toFixed(2)}`
                  : roundingAmount.toFixed(2))
              )
            }
            
            <div style={{ color: template.accent_color }}>
              {renderSummaryRow(
                "Total:",
                template.show_currency_symbol ? `$${finalTotal.toFixed(2)}` : finalTotal.toFixed(2),
                true
              )}
            </div>
            
            {template.show_separator_after_total && (
              <div className="my-2">
                {renderTotalSeparator(true)}
              </div>
            )}
          </div>

          {/* Notes */}
          {receiptData.notes && (
            <>
              <div className="my-4 border-t border-gray-300" style={{ borderStyle: 'dashed' }}></div>
              <div className="text-sm">
                <p className="font-medium mb-1">Notes:</p>
                <p className="opacity-80 whitespace-pre-line">{receiptData.notes}</p>
              </div>
            </>
          )}

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

          {/* Terms & Conditions */}
          {template.show_terms && template.terms_conditions && (
            <div className="mt-4 text-xs opacity-60">
              <p className="font-medium mb-1">Terms & Conditions:</p>
              <p className="whitespace-pre-line">{template.terms_conditions}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
