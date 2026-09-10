import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
    }

    // Google Play Store Reviewer Demo Access Bypass
    if (email === 'test@devpractice.io' && (password === 'reviewer123' || password === 'test1234')) {
      let reviewer = (await db.select().from(users).where(eq(users.email, 'test@devpractice.io')).limit(1))[0];
      if (!reviewer) {
        const created = await db.insert(users).values({
          email: 'test@devpractice.io',
          name: 'Google Reviewer',
          apiKey: 'eng_live_demo_reviewer',
          currentLevel: 'sde1',
          targetLevel: 'sde2',
          primaryStack: 'TypeScript, React, Node.js, PostgreSQL',
          focusAreas: 'System Design, Concurrency & State, Production Failure Modes',
        }).returning();
        reviewer = created[0];
      }

      return NextResponse.json({
        token: reviewer.apiKey || 'eng_live_demo_reviewer',
        user: {
          id: reviewer.id,
          email: reviewer.email,
          name: reviewer.name,
          currentLevel: reviewer.currentLevel,
          targetLevel: reviewer.targetLevel,
          primaryStack: reviewer.primaryStack,
          focusAreas: reviewer.focusAreas,
          apiKey: reviewer.apiKey,
        },
      });
    }

    // Standard user lookup
    const userMatch = (await db.select().from(users).where(eq(users.email, email)).limit(1))[0];
    if (!userMatch || !userMatch.passwordHash) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, userMatch.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    let apiKey = userMatch.apiKey;
    if (!apiKey) {
      apiKey = 'eng_live_' + crypto.randomBytes(16).toString('hex');
      await db.update(users).set({ apiKey }).where(eq(users.id, userMatch.id));
    }

    return NextResponse.json({
      token: apiKey,
      user: {
        id: userMatch.id,
        email: userMatch.email,
        name: userMatch.name,
        currentLevel: userMatch.currentLevel,
        targetLevel: userMatch.targetLevel,
        primaryStack: userMatch.primaryStack,
        focusAreas: userMatch.focusAreas,
        apiKey: apiKey,
      },
    });
  } catch (error: any) {
    console.error('Mobile login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
