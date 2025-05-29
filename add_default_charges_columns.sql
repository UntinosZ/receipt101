-- Add default charge configuration columns to the templates table
-- This migration adds support for default tax and service charge settings in templates

-- Add default tax rate column (percentage)
ALTER TABLE templates ADD COLUMN IF NOT EXISTS default_tax_rate DECIMAL(5,2) DEFAULT 8.5;

-- Add default service charge rate column (percentage) 
ALTER TABLE templates ADD COLUMN IF NOT EXISTS default_service_charge_rate DECIMAL(5,2) DEFAULT 5.0;

-- Add flag to enable tax by default
ALTER TABLE templates ADD COLUMN IF NOT EXISTS enable_tax_by_default BOOLEAN DEFAULT false;

-- Add flag to enable service charge by default
ALTER TABLE templates ADD COLUMN IF NOT EXISTS enable_service_charge_by_default BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN templates.default_tax_rate IS 'Default tax rate percentage (e.g., 8.5 for 8.5%)';
COMMENT ON COLUMN templates.default_service_charge_rate IS 'Default service charge rate percentage (e.g., 5.0 for 5%)';
COMMENT ON COLUMN templates.enable_tax_by_default IS 'Whether tax is enabled by default when creating receipts with this template';
COMMENT ON COLUMN templates.enable_service_charge_by_default IS 'Whether service charge is enabled by default when creating receipts with this template';
