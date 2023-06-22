import { type InferModel, relations, sql } from 'drizzle-orm';
import {
  char,
  datetime,
  int,
  mysqlTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import type { AdapterAccount } from 'next-auth/adapters';

export const users = mysqlTable('users', {
  id: char('id', { length: 36 })
    .default(sql`(UUID())`)
    .primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: varchar('image', { length: 255 }),
});

export type User = InferModel<typeof users>;

export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  documents: many(documents),
  documentVersions: many(documentVersion),
  proposals: many(proposals),
}));

export const accounts = mysqlTable(
  'accounts',
  {
    userId: char('user_id', { length: 36 }).default(sql`(UUID())`),
    type: varchar('type', { length: 255 })
      .$type<AdapterAccount['type']>()
      .notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('provider_account_id', {
      length: 255,
    }).notNull(),
    refresh_token: varchar('refresh_token', { length: 255 }),
    access_token: varchar('access_token', { length: 255 }),
    expires_at: int('expires_at'),
    token_type: varchar('token_type', { length: 255 }),
    scope: varchar('scope', { length: 255 }),
    id_token: varchar('id_token', { length: 255 }),
    session_state: varchar('session_state', { length: 255 }),
  },
  (accounts) => ({
    compoundKey: primaryKey(accounts.provider, accounts.providerAccountId),
  })
);

export type Account = InferModel<typeof accounts>;

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessions = mysqlTable('sessions', {
  sessionToken: varchar('session_token', { length: 255 })
    .notNull()
    .primaryKey(),
  userId: char('user_id', { length: 36 }).notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export type Session = InferModel<typeof sessions>;

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const verificationTokens = mysqlTable(
  'verification_tokens',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationTokens) => ({
    compoundKey: primaryKey(
      verificationTokens.identifier,
      verificationTokens.token
    ),
  })
);

export type VerificationToken = InferModel<typeof verificationTokens>;

export const userWhitelists = mysqlTable('user_whitelists', {
  email: varchar('email', { length: 255 }).primaryKey(),
});

export const documents = mysqlTable('documents', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  description: varchar('description', { length: 1024 }).notNull(),
  ownerId: char('owner_id', { length: 36 }).notNull(),
  currentVersionId: int('current_version_id'),
});

export type Document = InferModel<typeof documents>;

export const documentsRelations = relations(documents, ({ many, one }) => ({
  proposals: many(proposals),
  owner: one(users, {
    fields: [documents.ownerId],
    references: [users.id],
  }),
  currentVersion: one(documentVersion, {
    fields: [documents.currentVersionId],
    references: [documentVersion.id],
  }),
  allVersions: many(documentVersion),
}));

export const documentVersion = mysqlTable('document_versions', {
  id: serial('id').primaryKey(),
  documentId: int('document_id').notNull(),
  description: varchar('description', { length: 1024 }).notNull(),
  content: text('content').notNull(),
  authorId: char('author_id', { length: 36 }).notNull(),
  previousVersionId: int('previous_version_id'),
  createdAt: datetime('created_at').notNull(),
});

export type DocumentVersion = InferModel<typeof documentVersion>;

export const documentVersionRelations = relations(
  documentVersion,
  ({ one }) => ({
    document: one(documents, {
      fields: [documentVersion.documentId],
      references: [documents.id],
    }),
    author: one(users, {
      fields: [documentVersion.authorId],
      references: [users.id],
    }),
    previousVersion: one(documentVersion, {
      fields: [documentVersion.previousVersionId],
      references: [documentVersion.id],
    }),
  })
);

export const proposals = mysqlTable('proposals', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  description: varchar('description', { length: 1024 }).notNull(),
  documentId: int('document_id').notNull(),
  status: char('status', { length: 8, enum: ['open', 'approved', 'closed'] })
    .default('open')
    .notNull(),
  content: text('content').notNull(),
  authorId: char('author_id', { length: 36 }).notNull(),
  baseVersionId: int('base_version_id').notNull(),
  createdAt: datetime('created_at').notNull(),
});

export type Proposals = InferModel<typeof proposals>;

export const proposalsRelations = relations(proposals, ({ one }) => ({
  document: one(documents, {
    fields: [proposals.documentId],
    references: [documents.id],
  }),
  author: one(users, {
    fields: [proposals.authorId],
    references: [users.id],
  }),
  baseVersion: one(documentVersion, {
    fields: [proposals.baseVersionId],
    references: [documentVersion.id],
  }),
}));
