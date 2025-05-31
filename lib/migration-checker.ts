// Utility to check database migration status
import { supabase } from '@/lib/supabase'

export async function checkMigrationStatus() {
  try {
    // Test if the required columns exist by trying to select them
    const { data, error } = await supabase
      .from('templates')
      .select('default_tax_rate, enable_tax_by_default, show_separator_after_total')
      .limit(1)
    
    if (error) {
      // Check if it's a column not found error
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        return {
          migrationNeeded: true,
          missingColumns: true,
          error: error.message
        }
      }
      return {
        migrationNeeded: true,
        missingColumns: false,
        error: error.message
      }
    }
    
    return {
      migrationNeeded: false,
      missingColumns: false,
      error: null
    }
  } catch (err) {
    return {
      migrationNeeded: true,
      missingColumns: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}

export async function getMigrationInstructions() {
  return `
🚨 DATABASE MIGRATION REQUIRED

To fix the save/download issues, you need to run this SQL in your Supabase Dashboard:

1. Go to Supabase Dashboard > SQL Editor
2. Create a new query
3. Paste and run this SQL:

-- Complete migration for receipt101 app
ALTER TABLE templates ADD COLUMN IF NOT EXISTS default_tax_rate DECIMAL(5,2) DEFAULT 8.5;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS default_service_charge_rate DECIMAL(5,2) DEFAULT 5.0;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS enable_tax_by_default BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS enable_service_charge_by_default BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_separator_after_items_count BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_separator_after_subtotal BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_separator_after_service_charge BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_separator_after_before_tax BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_separator_after_tax BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_separator_after_total BOOLEAN DEFAULT true;

4. After running the migration, refresh your application
5. Test creating a receipt with default tax settings

This will fix:
✅ Default tax settings from templates
✅ Receipt saving functionality  
✅ Proper separator line configuration
✅ Template-based charge defaults
`
}
