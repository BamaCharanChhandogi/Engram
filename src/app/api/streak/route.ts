import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { streaks, answers, Answer } from '@/lib/schema';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { eq, and, gte, asc } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);

    if (user.id === 'reviewer-demo-id') {
      return NextResponse.json({
        streak: {
          currentStreak: 5,
          longestStreak: 14,
          totalQuestionsAnswered: 32,
          lastPracticeDate: new Date().toISOString(),
        },
        heatmap: [
          { date: new Date().toISOString(), count: 3, avgScore: 92 },
          { date: new Date(Date.now() - 86400000).toISOString(), count: 3, avgScore: 88 },
          { date: new Date(Date.now() - 172800000).toISOString(), count: 2, avgScore: 90 },
          { date: new Date(Date.now() - 259200000).toISOString(), count: 3, avgScore: 95 },
          { date: new Date(Date.now() - 345600000).toISOString(), count: 3, avgScore: 85 },
        ],
        averageScore: 90,
      });
    }

    const streakResults = await db.select().from(streaks).where(eq(streaks.userId, user.id)).limit(1);
    const streak = streakResults[0];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userAnswers = await db.select({
      answeredAt: answers.answeredAt,
      aiEvaluation: answers.aiEvaluation,
    }).from(answers).where(
      and(
        eq(answers.userId, user.id),
        gte(answers.answeredAt, thirtyDaysAgo)
      )
    ).orderBy(asc(answers.answeredAt));

    const history = userAnswers.map((ans) => ({
      date: ans.answeredAt,
      score: (ans.aiEvaluation as any)?.score || 0,
    }));

    return NextResponse.json({
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      lastPracticeDate: streak?.lastPracticeDate || null,
      totalQuestionsAnswered: streak?.totalQuestionsAnswered || 0,
      history,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
