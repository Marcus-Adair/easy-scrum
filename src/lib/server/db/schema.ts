import { pgTable, uuid, varchar, text, timestamp, integer, unique, pgEnum } from 'drizzle-orm/pg-core';
import { defineRelations } from 'drizzle-orm';

export const colorsEnum = pgEnum("colors", ["pink", "yellow", "blue", "orange", "salmon", "red", "green", "white", "purple"]);

// TODO: made things delete on cascade when i delete things

// DB Schematics
export const scrumSession = pgTable('scrum_session', {
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	name: varchar('name', { length: 100 }).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const scrumSessionUser = pgTable(
	'scrum_session_user',
	{
		id: uuid('id').primaryKey().notNull().defaultRandom(),
		name: varchar('name', { length: 50 }).notNull(),
		password: varchar('password', { length: 255 }),
		scrumSessionId: uuid('scrum_session_id')
			.notNull()
			.references(() => scrumSession.id),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(table) => [unique('unique_name_per_session').on(table.scrumSessionId, table.name)]
);

export const topic = pgTable('topic', {
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	scrumSessionId: uuid('scrum_session_id')
		.notNull()
		.references(() => scrumSession.id),
	topicName: varchar('topic_name', { length: 100 }).notNull(),
	color: colorsEnum().default("yellow").notNull(),
	rowIdx: integer('row_idx').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const noteCategory = pgTable('note_category', {
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	scrumSessionId: uuid('scrum_session_id')
		.notNull()
		.references(() => scrumSession.id),
	categoryName: varchar('category_name', { length: 50 }).notNull(),
	color: colorsEnum().default("pink").notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const note = pgTable('note', {
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	header: varchar('header', { length: 200 }).notNull(),
	notes: text('notes'),
	topicId: uuid('topic_id')
		.notNull()
		.references(() => topic.id),
	noteCategoryId: uuid('note_category_id').references(() => noteCategory.id),
	colIdx: integer('col_idx').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const comment = pgTable('comment', {
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	content: varchar('content', { length: 2000 }).notNull(),
	noteId: uuid('note_id')
		.notNull()
		.references(() => note.id),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// DB Relations:
export const relations = defineRelations(
	{ scrumSession, scrumSessionUser, topic, noteCategory, note, comment },
	(r) => ({
		scrumSession: {
			users: r.many.scrumSessionUser(),
			topics: r.many.topic(),
			noteCategories: r.many.noteCategory()
		},
		scrumSessionUser: {
			session: r.one.scrumSession({
				from: r.scrumSessionUser.scrumSessionId,
				to: r.scrumSession.id
			})
		},
		topic: {
			session: r.one.scrumSession({
				from: r.topic.scrumSessionId,
				to: r.scrumSession.id
			}),
			notes: r.many.note()
		},
		noteCategory: {
			session: r.one.scrumSession({
				from: r.noteCategory.scrumSessionId,
				to: r.scrumSession.id
			}),
			notes: r.many.note()
		},
		note: {
			topic: r.one.topic({
				from: r.note.topicId,
				to: r.topic.id
			}),
			noteCategory: r.one.noteCategory({
				from: r.note.noteCategoryId,
				to: r.noteCategory.id
			}),
			comments: r.many.comment()
		},
		comment: {
			note: r.one.note({
				from: r.comment.noteId,
				to: r.note.id
			})
		}
	})
);
