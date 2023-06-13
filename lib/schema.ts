import { relations } from 'drizzle-orm';
import {
  char,
  int,
  mysqlTable,
  serial,
  text,
  varchar,
} from 'drizzle-orm/mysql-core';

export const documents = mysqlTable('documents', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  description: varchar('description', { length: 1024 }).notNull(),
  currentVersionId: int('current_version_id'),
});

export const documentsRelations = relations(documents, ({ many, one }) => ({
  suggestions: many(changeSuggestions),
  currentVersion: one(documentVersion, {
    fields: [documents.currentVersionId],
    references: [documentVersion.id],
  }),
  allVersions: many(documentVersion),
}));

export const documentVersion = mysqlTable('document_versions', {
  id: serial('id').primaryKey(),
  documentId: int('document_id').notNull(),
  content: text('content').notNull(),
  previousVersionId: int('previous_version_id'),
});

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
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  description: varchar('description', { length: 1024 }).notNull(),
  documentId: int('document_id').notNull(),
  status: char('status', { length: 8, enum: ['open', 'approved', 'closed'] })
    .default('open')
    .notNull(),
  content: text('content').notNull(),
  baseVersionId: int('base_version_id').notNull(),
});

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
