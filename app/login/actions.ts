'use server';

import { eq, or } from 'drizzle-orm';

import db, { userWhitelists } from '@/lib/db';

export const getWhitelistStatus = (email: string) =>
  db
    .select()
    .from(userWhitelists)
    .where(
      or(
        eq(userWhitelists.email, email.toLowerCase()),
        eq(userWhitelists.email, email.split('@')[1].toLowerCase()),
      ),
    )
    .limit(1)
    .then((result) => result.length > 0);
