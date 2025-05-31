# 🚨 URGENT: Database Migration Required

## The Problem
You're getting "Error saving receipt: {}" because the database is missing required columns that were added in recent updates.

## The Solution
**Run this SQL migration in your Supabase Dashboard:**

### Step 1: Open Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Create a new query

### Step 2: Execute the Migration
Copy and paste this ENTIRE SQL block and click "Run":

```sql
-- Complete migration for Receipt101 app
-- This adds all missing columns to fix save/download issues

-- Add default charge configuration columns
ALTER TABLE templates ADD COLUMN IF NOT EXISTS default_tax_rate DECIMAL(5,2) DEFAULT 8.5;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS default_service_charge_rate DECIMAL(5,2) DEFAULT 5.0;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS enable_tax_by_default BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS enable_service_charge_by_default BOOLEAN DEFAULT false;

-- Add separator line settings columns
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_separator_after_items_count BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_separator_after_subtotal BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_separator_after_service_charge BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_separator_after_before_tax BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_separator_after_tax BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_separator_after_total BOOLEAN DEFAULT true;

-- Add missing columns to receipts table (if needed)
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS rounding_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS service_charge_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Update existing templates with sensible defaults
UPDATE templates 
SET 
  default_tax_rate = COALESCE(default_tax_rate, 8.5),
  default_service_charge_rate = COALESCE(default_service_charge_rate, 5.0),
  enable_tax_by_default = COALESCE(enable_tax_by_default, false),
  enable_service_charge_by_default = COALESCE(enable_service_charge_by_default, false),
  show_separator_after_items_count = COALESCE(show_separator_after_items_count, false),
  show_separator_after_subtotal = COALESCE(show_separator_after_subtotal, false),
  show_separator_after_service_charge = COALESCE(show_separator_after_service_charge, false),
  show_separator_after_before_tax = COALESCE(show_separator_after_before_tax, false),
  show_separator_after_tax = COALESCE(show_separator_after_tax, false),
  show_separator_after_total = COALESCE(show_separator_after_total, true)
WHERE id IS NOT NULL;
```

### Step 3: Verify Success
After running the migration, you should see:
- ✅ No errors in the SQL editor
- ✅ Message indicating successful execution

## What This Fixes
- ✅ Default tax settings from templates will apply correctly
- ✅ Receipt saving will work without empty error objects
- ✅ Separator lines will display properly
- ✅ Template-based defaults will work
- ✅ All save/download functionality will be restored

## After Migration
1. **Refresh your application** (Cmd+R or Ctrl+R)
2. **Test creating a new receipt**
3. **Verify that template defaults apply**
4. **Test saving and downloading receipts**

## If You Still Get Errors
If you still encounter issues after migration:
1. **Clear browser cache** (Cmd+Shift+R)
2. **Check browser console** for specific error messages
3. **Verify the migration ran successfully** by checking if templates have the new columns

---

**This migration is safe to run multiple times - it uses `IF NOT EXISTS` clauses.**
