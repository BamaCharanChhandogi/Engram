import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { captures, users } from '@/lib/schema';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { generateStandupPrep } from '@/lib/claude';
import { eq, and, gte } from 'drizzle-orm';

export async function POST() {
  try {
    const user = await getAuthenticatedUser();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userCaptures = await db
      .select()
      .from(captures)
      .where(and(eq(captures.userId, user.id), gte(captures.capturedAt, today)));

    if (userCaptures.length === 0) {
      return NextResponse.json(
        { message: 'No coding activity recorded today. Make edits in your IDE or CLI first.' },
        { status: 404 }
      );
    }

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

    const prepData = await generateStandupPrep(userCaptures, userProfile);

    return NextResponse.json(prepData);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Standup prep error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
