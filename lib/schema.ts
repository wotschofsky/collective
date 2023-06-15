import { type InferModel, relations, sql } from 'drizzle-orm';
import {
  char,
  datetime,
  mysqlTable,
  text,
  varchar,
} from 'drizzle-orm/mysql-core';

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
