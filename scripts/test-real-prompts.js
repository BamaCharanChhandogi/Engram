const fs = require('fs');

const transcriptPath = 'C:\\Users\\bcchh\\.gemini\\antigravity\\brain\\d761a7ff-4d13-478b-b99b-73ff9a79018f\\.system_generated\\logs\\transcript.jsonl';

if (!fs.existsSync(transcriptPath)) {
  console.log('Transcript file not found at:', transcriptPath);
  process.exit(1);
}

const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
const userPrompts = [];

for (const line of lines) {
  try {
    const entry = JSON.parse(line);
    if (entry.type === 'USER_INPUT' && entry.content && !entry.content.includes('<SYSTEM_MESSAGE>')) {
      const clean = entry.content.replace(/<[^>]+>/g, '').trim();
      if (clean && clean.length > 3) {
        userPrompts.push(clean);
      }
    }
  } catch (e) {}
}

console.log('--- FOUND', userPrompts.length, 'REAL PROMPTS FROM YOUR ACTUAL SESSION ---');
userPrompts.forEach((p, idx) => {
  console.log(`\n[Prompt #${idx + 1}]:\n"${p.substring(0, 120)}..."`);
});

// Now let's simulate the hook posting these actual prompts to our live /api/capture!
async function capturePrompts() {
  const userId = 'e60ef9af-9bbf-4eb9-94be-5a8a2f4669cc';
  const apiUrl = 'http://localhost:3000/api/capture';

  console.log('\n--> Forwarding your actual session prompts to Engram API...');

  for (const prompt of userPrompts) {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer engram-capture-secret',
          'X-User-Id': userId
        },
        body: JSON.stringify({
          event_type: 'prompt',
          tool: 'antigravity',
          payload: { prompt },
          session_id: 'd761a7ff-4d13-478b-b99b-73ff9a79018f',
          captured_at: new Date().toISOString()
        })
      });
      const data = await res.json();
      console.log('Saved prompt to Neon DB: ID =', data.id);
    } catch (err) {
      console.error('Failed to post prompt:', err.message);
    }
  }

  console.log('\nAll real prompts from this chat are now in your Neon database!');
}

capturePrompts();
