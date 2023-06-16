import { and, eq } from 'drizzle-orm';
import type { NextAuthOptions } from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import Email from 'next-auth/providers/email';
import crypto from 'node:crypto';

import db from './db';
import { accounts, sessions, users, verificationTokens } from './schema';

// Adapter from https://github.com/nextauthjs/next-auth/blob/e3dd9f4ed158390ce79278f273d8ae559ba42078/packages/adapter-drizzle/src/mysql/index.ts
const DrizzleAdapter = (): Adapter => ({
  createUser: async (data) => {
    const result = await db.insert(users).values(data);
    return db
      .select()
      .from(users)
      .where(eq(users.id, result.insertId))
      .then((res) => res[0]);
  },
  getUser: async (data) => {
    const thing =
      (await db
        .select()
        .from(users)
        .where(eq(users.id, data))
        .then((res) => res[0])) ?? null;

    console.log(thing);
    return thing;
  },
  getUserByEmail: async (data) => {
    return (
      db
        .select()
        .from(users)
        .where(eq(users.email, data))
        .then((res) => res[0]) ?? null
    );
  },
  createSession: async (data) => {
    await db.insert(sessions).values(data);

    return db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionToken, data.sessionToken))
      .then((res) => res[0]);
  },
  getSessionAndUser: async (data) => {
    return (
      db
        .select({
          session: sessions,
          user: users,
        })
        .from(sessions)
        .where(eq(sessions.sessionToken, data))
        .innerJoin(users, eq(users.id, sessions.userId))
        .then((res) => res[0]) ?? null
    );
  },
  updateUser: async (data) => {
    if (!data.id) {
      throw new Error('No user id.');
    }

    await db.update(users).set(data).where(eq(users.id, data.id));

    return db
      .select()
      .from(users)
      .where(eq(users.id, data.id))
      .then((res) => res[0]);
  },
  updateSession: async (data) => {
    await db
      .update(sessions)
      .set(data)
      .where(eq(sessions.sessionToken, data.sessionToken));

    return db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionToken, data.sessionToken))
      .then((res) => res[0]);
  },
  linkAccount: async (rawAccount) => {
    await db.insert(accounts).values(rawAccount);
  },
  getUserByAccount: async (account) => {
    const dbAccount = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.providerAccountId, account.providerAccountId),
          eq(accounts.provider, account.provider)
        )
      )
      .leftJoin(users, eq(accounts.userId, users.id))
      .then((res) => res[0]);

    return dbAccount?.users;
  },
  deleteSession: async (sessionToken) => {
    await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
  },
  createVerificationToken: async (token) => {
    await db.insert(verificationTokens).values(token);

    return db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.identifier, token.identifier))
      .then((res) => res[0]);
  },
  useVerificationToken: async (token) => {
    try {
      const deletedToken =
        (await db
          .select()
          .from(verificationTokens)
          .where(
            and(
              eq(verificationTokens.identifier, token.identifier),
              eq(verificationTokens.token, token.token)
            )
          )
          .then((res) => res[0])) ?? null;

      await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, token.identifier),
            eq(verificationTokens.token, token.token)
          )
        );

      return deletedToken;
    } catch (err) {
      throw new Error('No verification token found.');
    }
  },
  deleteUser: async (id) => {
    await db.delete(users).where(eq(users.id, id));
  },
  unlinkAccount: async (account) => {
    await db
      .delete(accounts)
      .where(
        and(
          eq(accounts.providerAccountId, account.providerAccountId),
          eq(accounts.provider, account.provider)
        )
      );

    return undefined;
  },
});

const md5 = (source: string) =>
  crypto.createHash('md5').update(source).digest('hex');

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  adapter: DrizzleAdapter(),
  providers: [
    Email({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (!token.email) {
        return session;
      }

      const emailHash = md5(token.email);

      const response = await fetch(`https://gravatar.com/${emailHash}.json`);
      if (response.status !== 200) {
        return session;
      }
      const { entry } = await response.json();

      return {
        user: {
          id: token.uid,
          email: token.email,
          name: entry[0].displayName || token.email,
          image: `https://gravatar.com/avatar/${emailHash}?s=64`,
        },
        expires: session.expires,
      };
    },
  },
};
