#!/bin/zsh

# Clean up script to remove unnecessary files before committing
# Run this script manually if needed

echo "🧹 Cleaning up test and temporary files..."

# Remove test files
rm -f test_*.js test_*.mjs debug_*.mjs diagnose_*.js check_*.mjs run_*.mjs verify_*.mjs
rm -f quick_diagnostic.js create_sample_data.js utils.ts

# Remove redundant migration files (keep only complete_migration.sql)
rm -f add_*.sql migration_safe.sql migration_instructions.sh schema_fix_*.sql separator_*.sql create_menu_*.sql

# Remove temporary documentation files (keep only MIGRATION_GUIDE.md and README.md)
rm -f *_FIXES.md *_DIAGNOSIS.md *_IMPLEMENTATION.md *_TEST.md
rm -f EMPTY_ERROR_FIX.md SAVE_ERROR_DIAGNOSIS.md TEMPLATE_SAVE_FIX.md
rm -f RECEIPT_PREVIEW_FIXES.md DEFAULT_CHARGES_IMPLEMENTATION.md ITEM_TABLE_SETTINGS_TEST.md

echo "✅ Cleanup complete!"
echo ""
echo "📋 Files to keep and commit:"
echo "- components/ (with your fixes)"
echo "- lib/ (with migration-checker.ts)"
echo "- MIGRATION_GUIDE.md (database migration instructions)"
echo "- complete_migration.sql (main migration file)"
echo "- .gitignore (updated to ignore test files)"
echo ""
echo "🚀 Ready to commit changes!"
