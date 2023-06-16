import { type InferModel, relations, sql } from 'drizzle-orm';
import {
  char,
  datetime,
  int,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { AdapterAccount } from 'next-auth/adapters';

export const users = mysqlTable('users', {
  id: char('id', { length: 36 })
    .default(sql`(UUID())`)
    .primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: varchar('image', { length: 255 }),
});

export const userRelations = relations(users, ({ one, many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
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

export const documents = mysqlTable('documents', {
  id: char('id', { length: 36 })
    .default(sql`(UUID())`)
    .primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  description: varchar('description', { length: 1024 }).notNull(),
  currentVersionId: char('current_version_id', { length: 36 }),
});

export type Document = InferModel<typeof documents>;

export const documentsRelations = relations(documents, ({ many, one }) => ({
  suggestions: many(changeSuggestions),
  currentVersion: one(documentVersion, {
    fields: [documents.currentVersionId],
    references: [documentVersion.id],
  }),
  allVersions: many(documentVersion),
}));

export const documentVersion = mysqlTable('document_versions', {
  id: char('id', { length: 36 })
    .default(sql`(UUID())`)
    .primaryKey(),
  documentId: char('document_id', { length: 36 }).notNull(),
  description: varchar('description', { length: 1024 }).notNull(),
  content: text('content').notNull(),
  author: varchar('author', { length: 256 }).notNull(),
  previousVersionId: char('previous_version_id', { length: 36 }),
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
    previousVersion: one(documentVersion, {
      fields: [documentVersion.previousVersionId],
      references: [documentVersion.id],
    }),
  })
);

export const changeSuggestions = mysqlTable('change_suggestions', {
  id: char('id', { length: 36 })
    .default(sql`(UUID())`)
    .primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  description: varchar('description', { length: 1024 }).notNull(),
  documentId: char('document_id', { length: 36 }).notNull(),
  status: char('status', { length: 8, enum: ['open', 'approved', 'closed'] })
    .default('open')
    .notNull(),
  content: text('content').notNull(),
  author: varchar('author', { length: 256 }).notNull(),
  baseVersionId: char('base_version_id', { length: 36 }).notNull(),
  createdAt: datetime('created_at').notNull(),
});

export type ChangeSuggestion = InferModel<typeof changeSuggestions>;

export const changeSuggestionsRelations = relations(
  changeSuggestions,
  ({ one }) => ({
    document: one(documents, {
      fields: [changeSuggestions.documentId],
      references: [documents.id],
    }),
    baseVersion: one(documentVersion, {
      fields: [changeSuggestions.baseVersionId],
      references: [documentVersion.id],
    }),
  })
);
