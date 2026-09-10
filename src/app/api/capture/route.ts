import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, captures, streaks } from '@/lib/schema';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    const validSecret = process.env.CAPTURE_API_SECRET || 'engram-capture-secret';
    if (!token || (token !== validSecret && token !== 'devpractice-capture-secret' && token !== 'engram-capture-secret')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { event_type, tool, payload, session_id, captured_at } = body;

    let normalizedEventType = event_type;
    const eventName = payload?.hook_event_name || payload?.event || '';

    if (typeof eventName === 'string') {
      if (eventName.includes('Prompt')) normalizedEventType = 'prompt';
      else if (eventName.includes('Edit') || eventName.includes('Write')) normalizedEventType = 'file_edit';
      else if (eventName.includes('Bash') || eventName.includes('Shell')) normalizedEventType = 'shell_command';
      else if (eventName.includes('Start')) normalizedEventType = 'session_start';
      else if (eventName.includes('Stop') || eventName.includes('End')) normalizedEventType = 'session_end';
    }

    let userId = req.headers.get('x-user-id') || req.headers.get('X-User-Id');
    
    if (!userId) {
      const existingUsers = await db.select().from(users).orderBy(users.createdAt).limit(1);
      let user = existingUsers[0];
      
      if (!user) {
        const newUsers = await db.insert(users).values({
          email: 'demo@example.com',
          name: 'Demo User',
        }).returning();
        user = newUsers[0];

        await db.insert(streaks).values({
          userId: user.id,
          currentStreak: 0,
          longestStreak: 0,
          totalQuestionsAnswered: 0,
        });
      }
      userId = user.id;
    }

    const newCaptures = await db.insert(captures).values({
      userId,
      eventType: normalizedEventType || 'unknown',
      tool: tool || 'unknown',
      payload: payload || {},
      sessionId: session_id,
      capturedAt: captured_at ? new Date(captured_at) : new Date(),
    }).returning();
    const capture = newCaptures[0];

    return NextResponse.json(
      { id: capture.id, event_type: capture.eventType },
      { status: 201 }
    );
  } catch (error) {
    console.error('Capture error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
