import { eq } from 'drizzle-orm';
import { db } from '../db';
import { note, topic } from '../db/schema';

export type CreateNoteInput = {
	header: string;
	notes?: string;
	topicId: string;
	noteCategoryId?: string;
	colIdx: number;
};

export type UpdateNoteInput = {
	header?: string;
	notes?: string;
	topicId?: string;
	noteCategoryId?: string | null;
	colIdx?: number;
};

async function touchTopic(topicId: string) {
	await db.update(topic).set({ updatedAt: new Date() }).where(eq(topic.id, topicId));
}

export async function createNote(input: CreateNoteInput) {
	const [newNote] = await db.insert(note).values(input).returning();
	await touchTopic(input.topicId);
	return newNote;
}

export async function getNoteById(id: string) {
	const n = await db.query.note.findFirst({
		where: { id },
		with: {
			comments: true,
			noteCategory: true
		}
	});
	return n ?? null;
}

export async function updateNote(id: string, input: UpdateNoteInput) {
	const [n] = await db
		.update(note)
		.set({ ...input, updatedAt: new Date() })
		.where(eq(note.id, id))
		.returning();
	if (n) await touchTopic(n.topicId);
	return n ?? null;
}

export async function deleteNote(id: string) {
	const [n] = await db.delete(note).where(eq(note.id, id)).returning();
	if (n) await touchTopic(n.topicId);
	return n ?? null;
}
