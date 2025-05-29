-- Safe migration script for Items Count configuration
-- Run these commands one by one in Supabase SQL Editor if the main script fails

-- Summary Layout Configuration (if not already added)
ALTER TABLE templates ADD COLUMN IF NOT EXISTS summary_layout_columns INTEGER;
UPDATE templates SET summary_layout_columns = 2 WHERE summary_layout_columns IS NULL;

ALTER TABLE templates ADD COLUMN IF NOT EXISTS summary_column1_width DECIMAL;
UPDATE templates SET summary_column1_width = 50 WHERE summary_column1_width IS NULL;

ALTER TABLE templates ADD COLUMN IF NOT EXISTS summary_column2_width DECIMAL;
UPDATE templates SET summary_column2_width = 50 WHERE summary_column2_width IS NULL;

ALTER TABLE templates ADD COLUMN IF NOT EXISTS summary_column3_width DECIMAL;
UPDATE templates SET summary_column3_width = 0 WHERE summary_column3_width IS NULL;

ALTER TABLE templates ADD COLUMN IF NOT EXISTS summary_labels_alignment VARCHAR(10);
UPDATE templates SET summary_labels_alignment = 'left' WHERE summary_labels_alignment IS NULL;

ALTER TABLE templates ADD COLUMN IF NOT EXISTS summary_values_alignment VARCHAR(10);
UPDATE templates SET summary_values_alignment = 'right' WHERE summary_values_alignment IS NULL;

ALTER TABLE templates ADD COLUMN IF NOT EXISTS summary_labels_position VARCHAR(10);
UPDATE templates SET summary_labels_position = 'column1' WHERE summary_labels_position IS NULL;

ALTER TABLE templates ADD COLUMN IF NOT EXISTS summary_values_position VARCHAR(10);
UPDATE templates SET summary_values_position = 'column2' WHERE summary_values_position IS NULL;

-- Items Count Configuration
ALTER TABLE templates ADD COLUMN IF NOT EXISTS show_items_count BOOLEAN;
UPDATE templates SET show_items_count = true WHERE show_items_count IS NULL;

ALTER TABLE templates ADD COLUMN IF NOT EXISTS items_count_layout_columns INTEGER;
UPDATE templates SET items_count_layout_columns = 2 WHERE items_count_layout_columns IS NULL;

ALTER TABLE templates ADD COLUMN IF NOT EXISTS items_count_column1_width DECIMAL;
UPDATE templates SET items_count_column1_width = 50 WHERE items_count_column1_width IS NULL;

ALTER TABLE templates ADD COLUMN IF NOT EXISTS items_count_column2_width DECIMAL;
UPDATE templates SET items_count_column2_width = 50 WHERE items_count_column2_width IS NULL;

ALTER TABLE templates ADD COLUMN IF NOT EXISTS items_count_column3_width DECIMAL;
UPDATE templates SET items_count_column3_width = 0 WHERE items_count_column3_width IS NULL;

ALTER TABLE templates ADD COLUMN IF NOT EXISTS items_count_labels_alignment VARCHAR(10);
UPDATE templates SET items_count_labels_alignment = 'left' WHERE items_count_labels_alignment IS NULL;

ALTER TABLE templates ADD COLUMN IF NOT EXISTS items_count_values_alignment VARCHAR(10);
UPDATE templates SET items_count_values_alignment = 'right' WHERE items_count_values_alignment IS NULL;

ALTER TABLE templates ADD COLUMN IF NOT EXISTS items_count_labels_position VARCHAR(10);
UPDATE templates SET items_count_labels_position = 'column1' WHERE items_count_labels_position IS NULL;

ALTER TABLE templates ADD COLUMN IF NOT EXISTS items_count_values_position VARCHAR(10);
UPDATE templates SET items_count_values_position = 'column2' WHERE items_count_values_position IS NULL;
