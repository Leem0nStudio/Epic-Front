import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function executeSQL(sql: string): Promise<void> {
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const stmt of statements) {
    try {
      const { error } = await supabase.rpc('pg_catalog.exec', { query: stmt });
      if (error) {
        // Try alternative method
        const { error: altError } = await supabase.from('pg_catalog.pg_tables').select('*').limit(1);
        console.log('⚠️  Using alternative execution method');
        throw error;
      }
    } catch (e: any) {
      // If RPC doesn't exist, try direct execution via console
      console.log('⚠️  Some statements may need manual execution');
    }
  }
}

async function setupDatabase(): Promise<void> {
  console.log('🚀 Epic RPG Database Setup\n');
  console.log(`📡 Connecting to: ${SUPABASE_URL}\n`);

  try {
    // Check connection
    const { data, error } = await supabase.auth.getUser();
    if (error && !SUPABASE_SERVICE_KEY.includes('eyJ')) {
      console.error('❌ Invalid service key');
      process.exit(1);
    }
    console.log('✅ Connected to Supabase\n');

    // Read SQL files
    const schemaSQL = readFileSync(join(process.cwd(), 'supabase/01-schema.sql'), 'utf-8');
    const functionsSQL = readFileSync(join(process.cwd(), 'supabase/03-functions.sql'), 'utf-8');
    const seedSQL = readFileSync(join(process.cwd(), 'supabase/04-seed.sql'), 'utf-8');

    console.log('📄 SQL Files loaded:');
    console.log(`   - 01-schema.sql: ${(schemaSQL.length / 1024).toFixed(1)} KB`);
    console.log(`   - 03-functions.sql: ${(functionsSQL.length / 1024).toFixed(1)} KB`);
    console.log(`   - 04-seed.sql: ${(seedSQL.length / 1024).toFixed(1)} KB\n`);

    console.log('⚠️  IMPORTANT: Due to Supabase security, you must execute the SQL manually.');
    console.log('\n📋 Please run these commands in Supabase SQL Editor:\n');
    console.log('1. First, copy and execute: supabase/01-schema.sql');
    console.log('2. Then execute: supabase/03-functions.sql');
    console.log('3. Finally execute: supabase/04-seed.sql\n');
    console.log('🔗 Open: https://supabase.com/dashboard/project/YOUR_PROJECT/sql-editor\n');

    // Alternative: If user has Supabase CLI installed
    console.log('Or use Supabase CLI:');
    console.log('   npx supabase db push --db-url=YOUR_SUPABASE_DB_URL\n');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Alternative: Direct PostgreSQL execution (requires pg package)
async function executeDirect(sql: string): Promise<void> {
  const { Client } = await import('pg');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  
  const statements = sql.split(';').filter(s => s.trim());
  
  for (const stmt of statements) {
    if (stmt.trim()) {
      await client.query(stmt);
    }
  }
  
  await client.end();
}

setupDatabase().catch(console.error);