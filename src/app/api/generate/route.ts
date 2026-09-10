import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { captures, questions, users } from '@/lib/schema';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { generateQuestions } from '@/lib/claude';
import { eq, and, gte } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    let userId: string;
    try {
      const user = await getAuthenticatedUser(req);
      userId = user.id;
    } catch {
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.split(' ')[1];
      if (token === process.env.ADMIN_SECRET) {
        const body = await req.json();
        userId = body.userId;
        if (!userId) return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
      } else {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userCaptures = await db.select().from(captures).where(
      and(
        eq(captures.userId, userId),
        gte(captures.capturedAt, today)
      )
    );

    // If user has no local captures recorded today, provide starter calibrated reps
    if (userCaptures.length === 0) {
      const starterQuestions = [
        {
          type: 'comprehension',
          difficulty: 'medium',
          question: "When designing an API endpoint that processes user prompts and streams LLM output, why is Server-Sent Events (SSE) preferred over standard blocking HTTP POST requests? What are the implications for Node.js event-loop performance and client-side Time to First Token (TTFT)?",
          codeContext: JSON.stringify({
            eventType: "prompt",
            tool: "codex",
            payload: { prompt: "Explain SSE streaming mechanics vs WebSockets in Node.js" }
          }, null, 2),
          referenceAnswer: "SSE enables progressive chunk streaming directly to the client as tokens are generated, reducing TTFT from seconds to milliseconds. In Node.js, streaming avoids buffering massive response payloads in V8 heap memory and keeps connections open without thread blockage."
        },
        {
          type: 'debugging',
          difficulty: 'hard',
          question: "In an asynchronous worker processing batch database syncs with PostgreSQL, what causes connection pool starvation under high concurrent traffic, and how do connection idle timeouts and statement timeouts mitigate hung transactions?",
          codeContext: JSON.stringify({
            eventType: "file_edit",
            tool: "claude-code",
            payload: { file: "workers/db_sync.ts", diff: "+ await db.transaction(async tx => await processBatch(tx))" }
          }, null, 2),
          referenceAnswer: "Connection pool starvation occurs when transactions remain open waiting for slow external network calls or missing indexes, exhausting pool max connections. Statement timeouts and idle-in-transaction timeouts abort hung sessions and return pool handles."
        },
        {
          type: 'system_design',
          difficulty: 'medium',
          question: "In distributed microservices, how does the Cache-Aside pattern differ from Write-Through caching? Under what conditions does Cache-Aside suffer from a Cache Stampede (thundering herd), and how do probabilistic early expirations or mutex locks prevent it?",
          codeContext: JSON.stringify({
            eventType: "shell_command",
            tool: "terminal",
            payload: { command: "redis-cli set key:session val EX 3600" }
          }, null, 2),
          referenceAnswer: "In Cache-Aside, the application lazily queries cache on miss, queries DB, and populates cache. A cache stampede occurs when a high-traffic key expires, triggering concurrent DB queries simultaneously. Mutex locks or XFetch probabilistic expiration prevent this spike."
        }
      ];

      const inserted = await Promise.all(
        starterQuestions.map(async (q) => {
          const res = await db.insert(questions).values({
            userId,
            practiceDate: today,
            questionType: q.type as any,
            questionText: q.question,
            codeContext: q.codeContext,
            referenceAnswer: q.referenceAnswer,
            difficulty: q.difficulty as any,
            agentSource: 'engram-core',
            sourceCaptureIds: [],
          }).returning();
          return res[0];
        })
      );

      return NextResponse.json({
        questions: inserted,
        practiceDate: today,
      }, { status: 201 });
    }

    // Query user profile for career level calibration
    const userRecords = await db
      .select({
        currentLevel: users.currentLevel,
        targetLevel: users.targetLevel,
        primaryStack: users.primaryStack,
        focusAreas: users.focusAreas,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const userProfile = userRecords[0];

    const questionsData = await generateQuestions(userCaptures, userProfile);

    const primaryTool = userCaptures[0]?.tool || 'claude-code';

    const createdQuestions = await Promise.all(
      questionsData.map(async (q: any) => {
        const result = await db.insert(questions).values({
          userId,
          practiceDate: today,
          questionType: q.type,
          questionText: q.question,
          codeContext: q.codeContext || null,
          referenceAnswer: q.referenceAnswer || null,
          difficulty: q.difficulty || 'medium',
          agentSource: primaryTool,
          sourceCaptureIds: q.sourceCaptureIds || [],
        }).returning();
        return result[0];
      })
    );

    return NextResponse.json(createdQuestions, { status: 201 });
  } catch (error: any) {
    console.error('Generate error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
