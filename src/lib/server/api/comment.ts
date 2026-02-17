import { eq } from 'drizzle-orm';
import { db } from '../db';
import { comment, note } from '../db/schema';

export type CreateCommentInput = {
	content: string;
	noteId: string;
};

export type UpdateCommentInput = {
	content?: string;
};

async function touchNote(noteId: string) {
	await db.update(note).set({ updatedAt: new Date() }).where(eq(note.id, noteId));
}

export async function createComment(input: CreateCommentInput) {
	const [newComment] = await db.insert(comment).values(input).returning();
	await touchNote(input.noteId);
	return newComment;
}

export async function getCommentById(id: string) {
	const c = await db.query.comment.findFirst({
		where: { id }
	});
	return c ?? null;
}

export async function updateComment(id: string, input: UpdateCommentInput) {
	const [c] = await db
		.update(comment)
		.set({ ...input, updatedAt: new Date() })
		.where(eq(comment.id, id))
		.returning();
	if (c) await touchNote(c.noteId);
	return c ?? null;
}

export async function deleteComment(id: string) {
	const [c] = await db.delete(comment).where(eq(comment.id, id)).returning();
	if (c) await touchNote(c.noteId);
	return c ?? null;
}
