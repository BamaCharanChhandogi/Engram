const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

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

export async function generateQuestions(captures: any[]) {
  const systemPrompt = `You are an expert technical interviewer and mentor. Your task is to generate personalized practice questions based on a user's recent coding session activities.
You must output a strictly valid JSON array of objects adhering to this schema:
[
  {
    "type": "code_comprehension" | "debugging" | "interview",
    "question": "string - clear and actionable question",
    "codeContext": "string - snippet of the code involved, or null",
    "referenceAnswer": "string - detailed reference answer",
    "difficulty": "easy" | "medium" | "hard",
    "sourceCaptureIds": ["string - id from captures"]
  }
]`;

  const userPrompt = `Based on these user activity captures, generate:
- 2 code comprehension questions ("Why was this implemented this way?", "What edge cases exist?")
- 1 debugging question (inject a subtle bug or anti-pattern and ask how to fix it)
- 1 interview-style conceptual question inspired by this code

Captures from today:
${JSON.stringify(captures, null, 2)}`;

  return callAI(systemPrompt, userPrompt, 0.5);
}

export async function evaluateAnswer(question: string, referenceAnswer: string, userAnswer: string) {
  const systemPrompt = `You are a supportive, high-standards senior tech lead evaluating a developer's answer to a code comprehension or system design question.
Output strictly valid JSON with this schema:
{
  "score": number between 0 and 100,
  "feedback": "string - constructive feedback on what was good and what could improve",
  "correct_parts": ["string - bullet point of strong points"],
  "gaps": ["string - bullet point of missing details or misunderstandings"]
}`;

  const userPrompt = `Question:
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
