import { eq } from 'drizzle-orm';
import { db } from '../db';
import { noteCategory, scrumSession, colorsEnum } from '../db/schema';

type Color = (typeof colorsEnum.enumValues)[number];

export type CreateNoteCategoryInput = {
	scrumSessionId: string;
	categoryName: string;
	color: Color;
};

export type UpdateNoteCategoryInput = {
	categoryName?: string;
	color?: Color;
};

async function touchSession(sessionId: string) {
	await db.update(scrumSession).set({ updatedAt: new Date() }).where(eq(scrumSession.id, sessionId));
}

export async function createNoteCategory(input: CreateNoteCategoryInput) {
	const [category] = await db.insert(noteCategory).values(input).returning();
	await touchSession(input.scrumSessionId);
	return category;
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
