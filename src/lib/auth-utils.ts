import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { db } from './db';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export async function getAuthenticatedUser(request?: Request) {
  // 1. Check Bearer token in Authorization header if request is provided
  if (request) {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]?.trim();
      if (token) {
        // Support Google Play Reviewer demo session
        if (token === 'demo_token' || token === 'eng_live_demo_reviewer') {
          const reviewerMatch = await db.select().from(users).where(eq(users.email, 'test@devpractice.io')).limit(1);
          if (reviewerMatch.length > 0) {
            return {
              id: reviewerMatch[0].id,
              email: reviewerMatch[0].email,
              name: reviewerMatch[0].name,
            };
          }
          // If reviewer user doesn't exist yet, return demo profile
          return {
            id: 'reviewer-demo-id',
            email: 'test@devpractice.io',
            name: 'Google Reviewer',
          };
        }

        // Match against user API key
        const userMatch = await db.select().from(users).where(eq(users.apiKey, token)).limit(1);
        if (userMatch.length > 0) {
          return {
            id: userMatch[0].id,
            email: userMatch[0].email,
            name: userMatch[0].name,
          };
        }
      }
    }
  }

  // 2. Fallback to NextAuth web session
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return {
    id: session.user.id as string,
    email: session.user.email as string,
    name: session.user.name as string | null,
  };
}

