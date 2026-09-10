const postgres = require('postgres');
const crypto = require('crypto');

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  const sql = postgres(connectionString);
  try {
    console.log('Migrating users and questions tables for personal API keys and agent sources...');
    
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS api_key text UNIQUE;`;
    await sql`ALTER TABLE questions ADD COLUMN IF NOT EXISTS agent_source text DEFAULT 'claude-code';`;

    // Populate api_key for any existing user who doesn't have one
    const usersWithoutKey = await sql`SELECT id FROM users WHERE api_key IS NULL;`;
    for (const u of usersWithoutKey) {
      const newKey = 'eng_live_' + crypto.randomBytes(16).toString('hex');
      await sql`UPDATE users SET api_key = ${newKey} WHERE id = ${u.id};`;
      console.log(`Generated key for user ${u.id}: ${newKey}`);
    }

    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await sql.end();
  }
}

migrate();
