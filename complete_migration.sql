-- Complete migration for both default charges and separator columns
-- Run this in your Supabase SQL editor to add all missing columns

-- PART 1: Add default charge configuration columns (for tax settings)
ALTER TABLE templates ADD COLUMN IF NOT EXISTS default_tax_rate DECIMAL(5,2) DEFAULT 8.5;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS default_service_charge_rate DECIMAL(5,2) DEFAULT 5.0;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS enable_tax_by_default BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS enable_service_charge_by_default BOOLEAN DEFAULT false;

-- PART 2: Add separator line settings columns
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_separator_after_items_count BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_separator_after_subtotal BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_separator_after_service_charge BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_separator_after_before_tax BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_separator_after_tax BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_separator_after_total BOOLEAN DEFAULT true;

-- PART 3: Update existing templates with defaults
UPDATE templates 
SET 
  -- Default charge settings
  default_tax_rate = COALESCE(default_tax_rate, 8.5),
  default_service_charge_rate = COALESCE(default_service_charge_rate, 5.0),
  enable_tax_by_default = COALESCE(enable_tax_by_default, false),
  enable_service_charge_by_default = COALESCE(enable_service_charge_by_default, false),
  -- Separator settings (only "after total" enabled by default)
  show_separator_after_items_count = COALESCE(show_separator_after_items_count, false),
  show_separator_after_subtotal = COALESCE(show_separator_after_subtotal, false),
  show_separator_after_service_charge = COALESCE(show_separator_after_service_charge, false),
  show_separator_after_before_tax = COALESCE(show_separator_after_before_tax, false),
  show_separator_after_tax = COALESCE(show_separator_after_tax, false),
  show_separator_after_total = COALESCE(show_separator_after_total, true);

-- PART 4: Add documentation comments
COMMENT ON COLUMN templates.default_tax_rate IS 'Default tax rate percentage (e.g., 8.5 for 8.5%)';
COMMENT ON COLUMN templates.default_service_charge_rate IS 'Default service charge rate percentage (e.g., 5.0 for 5%)';
COMMENT ON COLUMN templates.enable_tax_by_default IS 'Whether tax is enabled by default when creating receipts with this template';
COMMENT ON COLUMN templates.enable_service_charge_by_default IS 'Whether service charge is enabled by default when creating receipts with this template';
COMMENT ON COLUMN templates.show_separator_after_items_count IS 'Whether to show separator line after items count';
COMMENT ON COLUMN templates.show_separator_after_subtotal IS 'Whether to show separator line after subtotal';
COMMENT ON COLUMN templates.show_separator_after_service_charge IS 'Whether to show separator line after service charge';
COMMENT ON COLUMN templates.show_separator_after_before_tax IS 'Whether to show separator line after before tax amount';
COMMENT ON COLUMN templates.show_separator_after_tax IS 'Whether to show separator line after tax';
COMMENT ON COLUMN templates.show_separator_after_total IS 'Whether to show separator line after total (default: true)';

-- PART 5: Verify the migration worked
SELECT 
  'Migration completed successfully! Sample template data:' as message,
  id,
  name,
  default_tax_rate,
  enable_tax_by_default,
  show_separator_after_total
FROM templates 
LIMIT 3;
