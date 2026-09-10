import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, captures, questions, answers, streaks, accounts, sessions } from '@/lib/schema';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const authUser = await getAuthenticatedUser(req);

    // Delete user's related data in cascade order
    await db.delete(answers).where(eq(answers.userId, authUser.id));
    await db.delete(questions).where(eq(questions.userId, authUser.id));
    await db.delete(captures).where(eq(captures.userId, authUser.id));
    await db.delete(streaks).where(eq(streaks.userId, authUser.id));
    await db.delete(accounts).where(eq(accounts.userId, authUser.id));
    await db.delete(sessions).where(eq(sessions.userId, authUser.id));
    await db.delete(users).where(eq(users.id, authUser.id));

    return NextResponse.json({ message: 'Account and associated data successfully deleted.' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Delete account error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
