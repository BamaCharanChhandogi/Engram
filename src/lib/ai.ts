const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export interface UserProfileCalibration {
  currentLevel?: string | null;
  targetLevel?: string | null;
  primaryStack?: string | null;
  focusAreas?: string | null;
}

async function callAI(systemPrompt: string, userPrompt: string, temperature = 0.7) {
  // 1. Prefer Gemini if GEMINI_API_KEY is provided
  if (GEMINI_API_KEY) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          temperature,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    return JSON.parse(textContent);
  }

  // 2. Fallback to Claude if ANTHROPIC_API_KEY is provided
  if (ANTHROPIC_API_KEY) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-20250414',
        max_tokens: 4096,
        temperature,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const textContent = data.content?.find((c: any) => c.type === 'text')?.text || '';
    const jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/) || 
                      textContent.match(/```\n([\s\S]*?)\n```/) || 
                      [null, textContent];
    return JSON.parse(jsonMatch[1].trim());
  }

  throw new Error('No AI API key found. Please configure GEMINI_API_KEY or ANTHROPIC_API_KEY in .env');
}

export async function generateQuestions(captures: any[], userProfile?: UserProfileCalibration) {
  const current = (userProfile?.currentLevel || 'sde1').toUpperCase();
  const target = (userProfile?.targetLevel || 'sde2').toUpperCase();
  const focus = userProfile?.focusAreas || 'System Design, Concurrency & State, Production Failure Modes';
  const stack = userProfile?.primaryStack || 'TypeScript, React, Node.js';

  let calibrationInstruction = '';
  if (target.includes('SDE1') || target.includes('SDE-1')) {
    calibrationInstruction = `
CRITICAL CALIBRATION FOR ${current} ➔ ${target} PROMOTION:
- The developer is progressing from intern/junior to full-time SDE-1 engineer.
- Focus questions on:
  1. Writing clean, modular, and maintainable functions
  2. Proper error handling, input validation, and defensive programming
  3. Designing comprehensive unit and integration test cases for this diff
  4. Explaining the execution flow and business logic with precision`;
  } else if (target.includes('SDE2') || target.includes('SDE-2')) {
    calibrationInstruction = `
CRITICAL CALIBRATION FOR ${current} ➔ ${target} PROMOTION:
- The developer is progressing from junior execution to mid-level engineering ownership.
- DO NOT ask superficial syntax questions.
- Focus questions on:
  1. Concurrency hazards, race conditions, and idempotency guarantees
  2. Edge cases, database transaction rollbacks, and silent error states
  3. Latency, query performance bottlenecks, and caching invalidation
  4. Explicit code design trade-offs made in the captured session diffs`;
  } else if (target.includes('SENIOR') || target.includes('SDE3') || target.includes('SDE-3')) {
    calibrationInstruction = `
CRITICAL CALIBRATION FOR ${current} ➔ ${target} (SENIOR ENGINEER):
- Challenge the developer at a Senior Tech Lead standard.
- Focus questions on:
  1. Distributed systems failure modes, network partitions, and partial failure handling
  2. High-traffic scaling limits, blast radius reduction, and connection pool behavior
  3. API backwards compatibility, schema evolution, and telemetry/observability
  4. Alternative architectural patterns that would have been superior and why`;
  } else if (target.includes('STAFF') || target.includes('LEAD') || target.includes('PRINCIPAL')) {
    calibrationInstruction = `
CRITICAL CALIBRATION FOR ${current} ➔ ${target} (STAFF/PRINCIPAL):
- Challenge the developer on cross-cutting organizational architecture.
- Focus questions on:
  1. Multi-tenant security isolation and compliance
  2. System decoupling, async event consistency, and domain boundary design
  3. Engineering velocity vs tech debt trade-offs at company scale`;
  } else {
    calibrationInstruction = `
Calibrate questions to elevate the developer from ${current} to ${target} with emphasis on ${focus}.`;
  }

  const systemPrompt = `You are an elite technical interviewer and engineering mentor at top tech companies.
Your mission is to generate 3 high-impact active recall questions based on a developer's real session diffs to bridge their knowledge gap from ${current} to ${target}.
Developer Stack: ${stack}
Target Focus Areas: ${focus}
${calibrationInstruction}

You must output a strictly valid JSON array of objects adhering to this schema:
[
  {
    "type": "code_comprehension" | "debugging" | "interview",
    "question": "string - clear, actionable, challenging question testing their target level",
    "codeContext": "string - relevant snippet from the session diff, or null",
    "referenceAnswer": "string - comprehensive answer demonstrating target level depth",
    "difficulty": "easy" | "medium" | "hard",
    "sourceCaptureIds": ["string - id from captures"]
  }
]`;

  const userPrompt = `Based on these user activity captures, generate:
- 1 architectural comprehension question ("Why was this designed this way?", "What concurrency or data integrity guarantees exist?")
- 1 deep debugging / edge case challenge (inject a realistic production failure mode or race condition into this diff)
- 1 target-level system design interview question inspired directly by the mechanics of this code

Session diffs from today:
${JSON.stringify(captures, null, 2)}`;

  return callAI(systemPrompt, userPrompt, 0.4);
}

export async function evaluateAnswer(
  question: string, 
  referenceAnswer: string, 
  userAnswer: string,
  userProfile?: UserProfileCalibration
) {
  const current = (userProfile?.currentLevel || 'sde1').toUpperCase();
  const target = (userProfile?.targetLevel || 'sde2').toUpperCase();

  const systemPrompt = `You are an exacting but empowering Staff Engineer evaluating a developer's answer.
The developer is currently ${current}, preparing for ${target}.
Evaluate their answer not just on basic correctness, but on whether they demonstrated the depth, precision, and edge-case awareness expected at ${target}.

Output strictly valid JSON with this schema:
{
  "score": number between 0 and 100,
  "feedback": "string - 2-3 sentences evaluating their technical depth against ${target} standards",
  "correct_parts": ["string - bullet point of strong architectural points they nailed"],
  "gaps": ["string - specific edge cases, failure modes, or senior-level nuances they missed"],
  "levelUpTip": "string - 1 concrete piece of advice to answer this like a ${target} in an interview"
}`;

  const userPrompt = `Target Career Gap: ${current} ➔ ${target}

Question:
${question}

Reference Answer:
${referenceAnswer}

Developer's Answer:
${userAnswer}`;

  return callAI(systemPrompt, userPrompt, 0.2);
}

export async function evaluatePrompts(prompts: string[]) {
  const systemPrompt = `You are a prompt engineering expert for AI coding tools (Claude Code, Cursor, Codex).
Evaluate the clarity, specificity, and efficiency of these developer prompts.
Output strictly valid JSON with this schema:
{
  "prompts": [
    {
      "original": "string",
      "score": number between 0 and 100,
      "suggestions": "string - how to write a sharper, more precise prompt"
    }
  ],
  "overallScore": number between 0 and 100,
  "tips": ["string - top 2-3 general habits to improve AI coding efficiency"]
}`;

  const userPrompt = `Prompts submitted today:
${JSON.stringify(prompts, null, 2)}`;

  return callAI(systemPrompt, userPrompt, 0.2);
}

export async function generateStandupPrep(captures: any[], userProfile?: UserProfileCalibration) {
  const target = (userProfile?.targetLevel || 'sde2').toUpperCase();

  const systemPrompt = `You are a Tech Lead coach. Based on today's captured session diffs, prepare a concise, high-confidence 60-second Standup & PR Defense Brief for an engineer targeting ${target}.
Output strictly valid JSON with this schema:
{
  "headline": "string - 1 sentence summary of what was delivered today",
  "keyDecisions": ["string - 2-3 architectural decisions made and why"],
  "tradeoffsConsidered": ["string - 1-2 alternatives considered or rejected"],
  "risksAndMitigations": ["string - 1-2 production edge cases or failure modes tested"]
}`;

  const userPrompt = `Today's diffs and prompts:
${JSON.stringify(captures, null, 2)}`;

  return callAI(systemPrompt, userPrompt, 0.3);
}
