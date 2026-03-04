import { eq, gt, and, sql } from 'drizzle-orm';
import { db } from '../db';
import { note, topic } from '../db/schema';

export type CreateNoteInput = {
	header: string;
	notes?: string;
	topicId: string;
	noteCategoryId?: string;
	createdById?: string;
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

export async function moveNote(id: string, newTopicId: string, newColIdx: number) {
	const existing = await getNoteById(id);
	if (!existing) return null;

	const oldTopicId = existing.topicId;
	const oldColIdx = existing.colIdx;

	const [n] = await db
		.update(note)
		.set({ topicId: newTopicId, colIdx: newColIdx, updatedAt: new Date() })
		.where(eq(note.id, id))
		.returning();

	if (n) {
		// Decrement colIdx for notes in the OLD topic that were after the moved note
		await db
			.update(note)
			.set({ colIdx: sql`${note.colIdx} - 1` })
			.where(and(eq(note.topicId, oldTopicId), gt(note.colIdx, oldColIdx)));
		await touchTopic(oldTopicId);
		await touchTopic(newTopicId);
	}
	return n ?? null;
}

export async function deleteNote(id: string) {
	const [n] = await db.delete(note).where(eq(note.id, id)).returning();
	if (n) {
		// Decrement colIdx for all notes after the deleted one
		await db
			.update(note)
			.set({ colIdx: sql`${note.colIdx} - 1` })
			.where(and(eq(note.topicId, n.topicId), gt(note.colIdx, n.colIdx)));
		await touchTopic(n.topicId);
	}
	return n ?? null;
}
