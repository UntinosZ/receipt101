-- Add summary layout configuration columns to templates table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE templates ADD COLUMN IF NOT EXISTS summary_layout_columns INTEGER DEFAULT 2;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS summary_column1_width DECIMAL DEFAULT 50;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS summary_column2_width DECIMAL DEFAULT 50;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS summary_column3_width DECIMAL DEFAULT 0;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS summary_labels_alignment VARCHAR(10) DEFAULT 'left';
ALTER TABLE templates ADD COLUMN IF NOT EXISTS summary_values_alignment VARCHAR(10) DEFAULT 'right';
ALTER TABLE templates ADD COLUMN IF NOT EXISTS summary_labels_position VARCHAR(10) DEFAULT 'column1';
ALTER TABLE templates ADD COLUMN IF NOT EXISTS summary_values_position VARCHAR(10) DEFAULT 'column2';

-- Add constraints to ensure valid values
ALTER TABLE templates ADD CONSTRAINT check_summary_layout_columns 
  CHECK (summary_layout_columns IN (2, 3));

ALTER TABLE templates ADD CONSTRAINT check_summary_labels_alignment 
  CHECK (summary_labels_alignment IN ('left', 'center', 'right'));

ALTER TABLE templates ADD CONSTRAINT check_summary_values_alignment 
  CHECK (summary_values_alignment IN ('left', 'center', 'right'));

ALTER TABLE templates ADD CONSTRAINT check_summary_labels_position 
  CHECK (summary_labels_position IN ('column1', 'column2', 'column3'));

ALTER TABLE templates ADD CONSTRAINT check_summary_values_position 
  CHECK (summary_values_position IN ('column1', 'column2', 'column3'));
