import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function getAuthenticatedUser(request?: Request) {
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
