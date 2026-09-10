import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { questions, answers, streaks, users } from '@/lib/schema';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { evaluateAnswer } from '@/lib/claude';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    const { questionId, answerText } = await req.json();

    if (!questionId || !answerText) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const questionResults = await db.select().from(questions).where(eq(questions.id, questionId)).limit(1);
    const question = questionResults[0];

    if (!question || question.userId !== user.id) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
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
      .where(eq(users.id, user.id))
      .limit(1);

    const userProfile = userRecords[0];

    const evaluation = await evaluateAnswer(
      question.questionText,
      question.referenceAnswer || '',
      answerText,
      userProfile
    );

    await db.insert(answers).values({
      userId: user.id,
      questionId: question.id,
      answerText,
      aiEvaluation: evaluation,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streakResults = await db.select().from(streaks).where(eq(streaks.userId, user.id)).limit(1);
    let streak = streakResults[0];

    if (!streak) {
      const newStreaks = await db.insert(streaks).values({
        userId: user.id,
        currentStreak: 1,
        longestStreak: 1,
        lastPracticeDate: today,
        totalQuestionsAnswered: 1,
      }).returning();
      streak = newStreaks[0];
    } else {
      await db.update(streaks).set({
        totalQuestionsAnswered: streak.totalQuestionsAnswered + 1
      }).where(eq(streaks.userId, user.id));
      streak.totalQuestionsAnswered += 1;
    }

    if (!streak.lastPracticeDate || streak.lastPracticeDate.getTime() !== today.getTime()) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let newStreak = 1;
      if (streak.lastPracticeDate && streak.lastPracticeDate.getTime() === yesterday.getTime()) {
        newStreak = streak.currentStreak + 1;
      }

      await db.update(streaks).set({
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streak.longestStreak),
        lastPracticeDate: today,
      }).where(eq(streaks.userId, user.id));
    }

    return NextResponse.json(evaluation);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
