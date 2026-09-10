const postgres = require('postgres');

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  const sql = postgres(connectionString);
  try {
    console.log('Migrating users table to add profile & target level columns...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS current_level text DEFAULT 'sde1';`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS target_level text DEFAULT 'sde2';`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_stack text DEFAULT 'TypeScript, React, Node.js';`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS focus_areas text DEFAULT 'System Design, Concurrency & State, Production Failure Modes';`;
    console.log('Users table successfully updated with profile and target level columns!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await sql.end();
  }
}

migrate();
