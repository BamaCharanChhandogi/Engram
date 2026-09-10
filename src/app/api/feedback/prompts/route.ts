import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { captures, Capture } from '@/lib/schema';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { evaluatePrompts } from '@/lib/claude';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    let userId: string;
    try {
      const user = await getAuthenticatedUser();
      userId = user.id;
    } catch {
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.split(' ')[1];
      const customUserId = req.headers.get('x-user-id');
      if (token === process.env.ADMIN_SECRET && customUserId) {
        userId = customUserId;
      } else {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
    }

    // Fetch recent prompt-type captures for the user (up to 10 latest)
    const promptCaptures = await db.select().from(captures).where(
      and(
        eq(captures.userId, userId),
        eq(captures.eventType, 'prompt')
      )
    ).orderBy(desc(captures.capturedAt)).limit(10);

    if (promptCaptures.length === 0) {
      return NextResponse.json({
        prompts: [],
        overallScore: 0,
        tips: [
          'Be specific: Mention exact filenames and components.',
          'Provide constraints: Specify libraries, performance requirements, or output formats.',
          'Share error logs or expected vs actual outputs.',
        ],
      });
    }

    const prompts = promptCaptures.map((c: Capture) => {
      const payload: any = c.payload;
      return payload.prompt || payload.text || payload.content || JSON.stringify(payload);
    });

    const feedback = await evaluatePrompts(prompts);
    return NextResponse.json(feedback);
  } catch (error: any) {
    console.error('Feedback route error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
