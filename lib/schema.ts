import { relations } from 'drizzle-orm';
import {
  char,
  int,
  mysqlTable,
  serial,
  text,
  varchar,
} from 'drizzle-orm/mysql-core';

export const projects = mysqlTable('projects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  description: varchar('description', { length: 1024 }),
  state: text('state').notNull(),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  suggestions: many(changeSuggestions),
}));

export const changeSuggestions = mysqlTable('change_suggestions', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  projectId: int('project_id').notNull(),
  status: char('status', { length: 8, enum: ['open', 'approved', 'closed'] })
    .default('open')
    .notNull(),
  comment: varchar('comment', { length: 1024 }),
  state: text('diff').notNull(),
});

export const changeSuggestionsRelations = relations(
  changeSuggestions,
  ({ one }) => ({
    project: one(projects, {
      fields: [changeSuggestions.projectId],
      references: [projects.id],
    }),
  })
);
