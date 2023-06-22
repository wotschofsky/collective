'use server';

import { eq } from 'drizzle-orm';

import db, { userWhitelists } from '@/lib/db';

export const getWhitelistStatus = (email: string) =>
  db
    .select()
    .from(userWhitelists)
    .where(eq(userWhitelists.email, email.toLowerCase()))
    .limit(1)
    .then((result) => result.length > 0);
