import { eq } from 'drizzle-orm';
import { db } from '../db';
import { noteCategory, scrumSession } from '../db/schema';

export type CreateNoteCategoryInput = {
	scrumSessionId: string;
	categoryName: string;
	color: string;
};

export type UpdateNoteCategoryInput = {
	categoryName?: string;
	color?: string;
};

async function touchSession(sessionId: string) {
	await db.update(scrumSession).set({ updatedAt: new Date() }).where(eq(scrumSession.id, sessionId));
}

export async function createNoteCategory(input: CreateNoteCategoryInput) {
	const [category] = await db.insert(noteCategory).values(input).returning();
	await touchSession(input.scrumSessionId);
	return category;
}

export async function getNoteCategoryById(id: string) {
	const category = await db.query.noteCategory.findFirst({
		where: { id }
	});
	return category ?? null;
}

export async function updateNoteCategory(id: string, input: UpdateNoteCategoryInput) {
	const [category] = await db
		.update(noteCategory)
		.set({ ...input, updatedAt: new Date() })
		.where(eq(noteCategory.id, id))
		.returning();
	if (category) await touchSession(category.scrumSessionId);
	return category ?? null;
}

export async function deleteNoteCategory(id: string) {
	const [category] = await db.delete(noteCategory).where(eq(noteCategory.id, id)).returning();
	if (category) await touchSession(category.scrumSessionId);
	return category ?? null;
}
