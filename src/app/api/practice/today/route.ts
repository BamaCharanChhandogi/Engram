import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { questions } from '@/lib/schema';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { eq, and, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let userQuestions = await db.select().from(questions).where(
      and(
        eq(questions.userId, user.id),
        eq(questions.practiceDate, today)
      )
    );

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
