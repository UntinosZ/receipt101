import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Template = {
  id: string
  name: string
  business_name: string
  business_address?: string
  business_phone?: string
  business_email?: string
  business_website?: string
  logo_url?: string
  logo_size: number
  logo_position: string
  show_logo: boolean
  background_color: string
  text_color: string
  accent_color: string
  font_family: string
  font_size: number
  show_border: boolean
  border_color: string
  header_style: string
  footer_text?: string
  show_footer: boolean
  terms_conditions?: string
  show_terms: boolean
  // New custom header fields - now multiline
  custom_header1?: string
  custom_header2?: string
  custom_header1_size: number
  custom_header2_size: number
  custom_header1_style: string
  custom_header2_style: string
  show_custom_headers: boolean
  custom_header_alignment: string
  // Simplified customer block fields
  show_customer_block: boolean
  customer_block_title?: string
  customer_block_title_size: number
  customer_block_title_style: string
  customer_block_text?: string
  customer_block_text_size: number
  customer_block_text_style: string
  customer_block_alignment: string
  show_datetime_in_customer: boolean
  datetime_format: string // 'combined' | 'separate'
  datetime_style: string
  datetime_size: number
  // New custom section before footer
  show_custom_section: boolean
  custom_section_title?: string
  custom_section_text?: string
  custom_section_title_size: number
  custom_section_text_size: number
  custom_section_title_style: string
  custom_section_text_style: string
  custom_section_alignment: string
  // New item table controls
  show_item_labels: boolean
  item_description_width: number // percentage
  item_quantity_width: number // percentage
  item_price_width: number // percentage
  item_total_width: number // percentage
  show_currency_symbol: boolean
  // Column visibility and arrangement
  show_description_column: boolean
  show_quantity_column: boolean
  show_price_column: boolean
  show_total_column: boolean
  column_order?: string[] | null // array of column names in order (optional, can be null)
  // Summary/Totals section configuration
  summary_layout_columns: number // 2 or 3 columns
  summary_column1_width: number // percentage
  summary_column2_width: number // percentage  
  summary_column3_width: number // percentage
  summary_labels_alignment: string // 'left', 'center', 'right'
  summary_values_alignment: string // 'left', 'center', 'right'
  summary_labels_position: string // 'column1', 'column2', 'column3'
  summary_values_position: string // 'column1', 'column2', 'column3'
  // Items count section configuration (separate from summary)
  show_items_count: boolean // whether to show "Items: X" row
  items_count_layout_columns: number // 2 or 3 columns
  items_count_column1_width: number // percentage
  items_count_column2_width: number // percentage
  items_count_column3_width: number // percentage
  items_count_labels_alignment: string // 'left', 'center', 'right'
  items_count_values_alignment: string // 'left', 'center', 'right'
  items_count_labels_position: string // 'column1', 'column2', 'column3'
  items_count_values_position: string // 'column1', 'column2', 'column3'
  // Default charge settings
  default_tax_rate: number // default tax rate percentage (e.g., 8.5)
  default_service_charge_rate: number // default service charge percentage (e.g., 5.0)
  enable_tax_by_default: boolean // whether tax is enabled by default
  enable_service_charge_by_default: boolean // whether service charge is enabled by default
  // Separator line settings for totals section
  show_separator_after_items_count?: boolean // separator after items count line
  show_separator_after_subtotal?: boolean // separator after subtotal line
  show_separator_after_service_charge?: boolean // separator after service charge line
  show_separator_after_before_tax?: boolean // separator after "before tax" line
  show_separator_after_tax?: boolean // separator after tax line
  show_separator_after_total?: boolean // separator after total line (final separator)
  created_by?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export type Receipt = {
  id: string
  receipt_number: string
  template_id?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  items: ReceiptItem[]
  subtotal: number
  tax_rate: number
  tax_amount: number
  service_charge_rate: number
  service_charge_amount: number
  discount_amount?: number
  rounding_amount?: number
  total: number
  receipt_date: string
  receipt_time?: string
  notes?: string
  created_by?: string
  is_public: boolean
  created_at: string
  updated_at: string
  template?: Template
}

export type ReceiptItem = {
  id: string
  description: string
  quantity: number
  price: number
}

export type MenuItem = {
  id: string
  template_id: string
  name: string
  description?: string
  price: number
  category?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}
