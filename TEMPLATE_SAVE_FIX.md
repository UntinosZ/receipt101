# Template Save Error Fix Instructions

## Issue
The template save is failing because the database table doesn't have the new summary layout columns that were added to the TypeScript interface.

## Immediate Fix Applied
✅ **Modified template save function** to temporarily exclude the new summary layout fields when saving to database
- This allows templates to save successfully right now
- The UI controls for summary layout still work for preview
- Data is just not persisted until database is updated

## Complete Fix Steps

### Step 1: Add Database Columns
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Run the SQL script: `/Users/nopparid.raw/Documents/personal/receipt101/add_summary_layout_columns.sql`
4. This will add all the missing columns with proper defaults and constraints

### Step 2: Re-enable Database Saving
After running the SQL script, update the save function in `template-designer.tsx`:

Remove the temporary field exclusion:
```typescript
// REMOVE THIS SECTION:
const { 
  summary_layout_columns,
  summary_column1_width,
  summary_column2_width,
  summary_column3_width,
  summary_labels_alignment,
  summary_values_alignment,
  summary_labels_position,
  summary_values_position,
  ...templateDataForDB
} = template;

const templateData = {
  ...templateDataForDB,
  updated_at: new Date().toISOString(),
}

// REPLACE WITH:
const templateData = {
  ...template,
  updated_at: new Date().toISOString(),
}
```

### Step 3: Test Complete Functionality
1. Start development server: `npm run dev`
2. Try creating/updating a template
3. Verify summary layout settings are saved and loaded correctly

## Current Status
- ✅ Templates can save (without summary layout fields)
- ✅ Summary layout UI controls work 
- ✅ Preview shows configurable layout
- ⏳ Summary layout settings not persisted (temporary)

## Files Modified
- `/components/template-designer.tsx` - Save function modified
- `/add_summary_layout_columns.sql` - Database migration script created
- Both `receipt-preview.tsx` and `template-designer.tsx` have proper fallbacks for missing fields
