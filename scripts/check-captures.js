const postgres = require('postgres');
const sql = postgres('postgresql://neondb_owner:npg_q2NLd5IxrGkH@ep-green-bread-ayh7ldm9-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function check() {
  const captures = await sql`SELECT id, tool, event_type, payload, captured_at FROM captures ORDER BY captured_at DESC LIMIT 5`;
  console.log("LATEST CAPTURES IN NEON:");
  console.log(JSON.stringify(captures, null, 2));
  await sql.end();
}

check();
