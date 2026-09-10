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
      const user = await getAuthenticatedUser();
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

    if (userCaptures.length === 0) {
      return NextResponse.json({ message: 'No captures found for today' }, { status: 404 });
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
