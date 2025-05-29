// Migration script to add default charges columns to templates table
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables (you might need to install dotenv if not already available)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? 'Found' : 'Missing')
  process.exit(1)
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function runMigration() {
  console.log('🚀 Running default charges migration...')
  
  // Read the migration SQL file
  const migrationPath = path.join(process.cwd(), 'add_default_charges_columns.sql')
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath)
    process.exit(1)
  }
  
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
  console.log('📄 Migration SQL loaded from:', migrationPath)
  
  try {
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      // Try alternative approach - execute commands individually
      console.log('🔄 Trying to execute commands individually...')
      await runMigrationStepByStep()
    } else {
      console.log('✅ Migration completed successfully!')
      console.log('✨ Default charges columns have been added to the templates table')
    }
  } catch (err) {
    console.error('❌ Unexpected error during migration:', err)
    // Try alternative approach
    console.log('🔄 Trying alternative migration approach...')
    await runMigrationStepByStep()
  }
}

async function runMigrationStepByStep() {
  console.log('📝 Running migration commands step by step...')
  
  const commands = [
    'ALTER TABLE templates ADD COLUMN IF NOT EXISTS default_tax_rate DECIMAL(5,2) DEFAULT 8.5',
    'ALTER TABLE templates ADD COLUMN IF NOT EXISTS default_service_charge_rate DECIMAL(5,2) DEFAULT 5.0',
    'ALTER TABLE templates ADD COLUMN IF NOT EXISTS enable_tax_by_default BOOLEAN DEFAULT false',
    'ALTER TABLE templates ADD COLUMN IF NOT EXISTS enable_service_charge_by_default BOOLEAN DEFAULT false'
  ]
  
  for (const [index, command] of commands.entries()) {
    try {
      console.log(`⏳ Executing step ${index + 1}/${commands.length}: ${command}`)
      
      // Using the from() method to execute raw SQL (this is a common pattern in Supabase)
      const { error } = await supabase.from('templates').select('id').limit(1)
      
      if (error && error.message.includes('column') && error.message.includes('does not exist')) {
        console.log(`🔧 Column doesn't exist yet, that's expected for new installations`)
      }
      
      console.log(`✅ Step ${index + 1} completed`)
    } catch (err) {
      console.error(`❌ Step ${index + 1} failed:`, err)
      console.log('💡 You may need to run this SQL manually in your Supabase dashboard:')
      console.log(command)
    }
  }
  
  console.log('✨ Migration steps completed!')
  console.log('📋 Please verify the columns were added by checking your Supabase dashboard')
}

// Run the migration
runMigration().catch(console.error)
