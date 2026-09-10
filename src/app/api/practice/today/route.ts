import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { questions } from '@/lib/schema';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let userQuestions = await db.select().from(questions).where(
      and(
        eq(questions.userId, user.id),
        eq(questions.practiceDate, today)
      )
    );

    if (userQuestions.length === 0 && user.id === 'reviewer-demo-id') {
      return NextResponse.json({
        questions: [
          {
            id: 'demo-q-1',
            questionType: 'comprehension',
            difficulty: 'medium',
            questionText: "When designing an API endpoint that processes user prompts and interacts with downstream LLM providers, why is Server-Sent Events (SSE) preferred over standard blocking HTTP POST requests? What are the implications for Node.js event-loop performance and client-side Time to First Token (TTFT)?",
            sourceContext: JSON.stringify({
              eventType: "prompt",
              tool: "codex",
              payload: { prompt: "Explain SSE vs WebSocket streaming in Node.js backend" }
            }, null, 2),
            referenceAnswer: "SSE enables progressive chunk streaming directly to the client as tokens are generated, reducing TTFT from seconds to milliseconds. In Node.js, streaming avoids buffering massive response payloads in V8 heap memory and keeps connection open without thread blockage.",
            userAnswer: null
          },
          {
            id: 'demo-q-2',
            questionType: 'debugging',
            difficulty: 'hard',
            questionText: "In an asynchronous worker processing batch database syncs, why would unhandled Promise rejections cause silent process memory leaks or abrupt termination in Node.js? How does modern Node.js process exit behavior differ between v14 and v18+?",
            sourceContext: JSON.stringify({
              eventType: "file_edit",
              tool: "claude-code",
              payload: { file: "workers/sync.ts", diff: "+ await Promise.all(items.map(async item => syncItem(item)))" }
            }, null, 2),
            referenceAnswer: "Unhandled rejections in modern Node.js trigger process exit with code 1 by default. When ignored via noop handlers, memory retains unresolved context references leading to leaks.",
            userAnswer: null
          }
        ],
        practiceDate: today,
      });
    }

    if (userQuestions.length === 0) {
      const latestQuestions = await db.select().from(questions)
        .where(eq(questions.userId, user.id))
        .orderBy(desc(questions.practiceDate))
        .limit(1);

      if (latestQuestions.length > 0) {
        userQuestions = await db.select().from(questions).where(
          and(
            eq(questions.userId, user.id),
            eq(questions.practiceDate, latestQuestions[0].practiceDate)
          )
        );
      }
    }

    if (userQuestions.length === 0) {
      return NextResponse.json({
        questions: [],
        message: 'No questions generated yet. Start coding to generate questions!'
      });
    }

    return NextResponse.json({
      questions: userQuestions,
      practiceDate: userQuestions[0].practiceDate,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
