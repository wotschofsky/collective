import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { userWhitelists } from '@/lib/schema';

export const POST = async (request: Request) => {
  const body = await request.json();
  const { email } = body;

  if (!email) {
    return new Response('Email is required', { status: 400 });
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  await db.insert(userWhitelists).values({
    email: email,
    invitedBy: session.user.id,
  });

  return new Response('OK', { status: 200 });
};
