import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const authUser = await getAuthenticatedUser(req);

    if (authUser.id === 'reviewer-demo-id') {
      return NextResponse.json({
        id: 'reviewer-demo-id',
        name: 'Google Reviewer',
        email: 'test@devpractice.io',
        image: null,
        currentLevel: 'sde1',
        targetLevel: 'sde2',
        primaryStack: 'TypeScript, React, Node.js, PostgreSQL',
        focusAreas: 'System Design, Concurrency & State, Production Failure Modes',
        apiKey: 'eng_live_demo_reviewer',
      });
    }

    const userRecords = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        currentLevel: users.currentLevel,
        targetLevel: users.targetLevel,
        primaryStack: users.primaryStack,
        focusAreas: users.focusAreas,
        apiKey: users.apiKey,
      })
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    if (userRecords.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    let profileData = userRecords[0];

    // If user has no apiKey yet, generate and save one
    if (!profileData.apiKey) {
      const crypto = await import('crypto');
      const generatedKey = 'eng_live_' + crypto.randomBytes(16).toString('hex');
      await db.update(users).set({ apiKey: generatedKey }).where(eq(users.id, authUser.id));
      profileData.apiKey = generatedKey;
    }

    return NextResponse.json(profileData);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Profile GET error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authUser = await getAuthenticatedUser(req);
    const body = await req.json();
    const { name, currentLevel, targetLevel, primaryStack, focusAreas } = body;

    if (authUser.id === 'reviewer-demo-id') {
      return NextResponse.json({
        id: 'reviewer-demo-id',
        name: name || 'Google Reviewer',
        email: 'test@devpractice.io',
        currentLevel: currentLevel || 'sde1',
        targetLevel: targetLevel || 'sde2',
        primaryStack: primaryStack || 'TypeScript, React, Node.js',
        focusAreas: focusAreas || 'System Design',
      });
    }

    const validLevels = ['intern', 'sde1', 'sde2', 'senior', 'staff'];
    const validTargets = ['sde1', 'sde2', 'senior', 'staff', 'principal'];

    const updated = await db
      .update(users)
      .set({
        name: name !== undefined ? name : undefined,
        currentLevel: validLevels.includes(currentLevel) ? currentLevel : undefined,
        targetLevel: validTargets.includes(targetLevel) ? targetLevel : undefined,
        primaryStack: typeof primaryStack === 'string' ? primaryStack : undefined,
        focusAreas: typeof focusAreas === 'string' ? focusAreas : undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, authUser.id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        currentLevel: users.currentLevel,
        targetLevel: users.targetLevel,
        primaryStack: users.primaryStack,
        focusAreas: users.focusAreas,
      });

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Profile PUT error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
