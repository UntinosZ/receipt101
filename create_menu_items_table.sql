-- Create menu_items table for template-specific menu items
-- This allows templates to have predefined menu items for quick receipt creation

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_template_id ON menu_items(template_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(sort_order);

-- Add RLS (Row Level Security) policies
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Policy for reading menu items (all authenticated users can read)
CREATE POLICY "Users can read menu items" ON menu_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for creating menu items (users can create for their own templates)
CREATE POLICY "Users can create menu items for their templates" ON menu_items
  FOR INSERT WITH CHECK (
    auth.uid() = (
      SELECT created_by FROM templates WHERE id = template_id
    )
  );

-- Policy for updating menu items (users can update their own menu items)
CREATE POLICY "Users can update their own menu items" ON menu_items
  FOR UPDATE USING (
    auth.uid() = (
      SELECT created_by FROM templates WHERE id = template_id
    )
  );

-- Policy for deleting menu items (users can delete their own menu items)
CREATE POLICY "Users can delete their own menu items" ON menu_items
  FOR DELETE USING (
    auth.uid() = (
      SELECT created_by FROM templates WHERE id = template_id
    )
  );

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_menu_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_items_updated_at();

-- Add comments for documentation
COMMENT ON TABLE menu_items IS 'Menu items associated with receipt templates for quick item selection';
COMMENT ON COLUMN menu_items.template_id IS 'Reference to the template this menu item belongs to';
COMMENT ON COLUMN menu_items.name IS 'Name of the menu item (e.g., "Coffee", "Service Fee")';
COMMENT ON COLUMN menu_items.description IS 'Optional description of the menu item';
COMMENT ON COLUMN menu_items.price IS 'Default price for this menu item';
COMMENT ON COLUMN menu_items.category IS 'Optional category for grouping menu items (e.g., "Beverages", "Services")';
COMMENT ON COLUMN menu_items.is_active IS 'Whether this menu item is currently active and should be shown';
COMMENT ON COLUMN menu_items.sort_order IS 'Sort order for displaying menu items (lower numbers first)';
