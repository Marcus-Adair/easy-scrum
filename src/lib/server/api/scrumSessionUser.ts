import { eq } from 'drizzle-orm';
import { db } from '../db';
import { scrumSessionUser, scrumSession } from '../db/schema';

export type CreateScrumSessionUserInput = {
	name: string;
	password?: string;
	scrumSessionId: string;
};

export type UpdateScrumSessionUserInput = {
	name?: string;
	password?: string;
};

async function touchSession(sessionId: string) {
	await db.update(scrumSession).set({ updatedAt: new Date() }).where(eq(scrumSession.id, sessionId));
}

export async function createScrumSessionUser(input: CreateScrumSessionUserInput) {
	const [user] = await db.insert(scrumSessionUser).values(input).returning();
	await touchSession(input.scrumSessionId);
	return user;
}

export async function getScrumSessionUserById(id: string) {
	const user = await db.query.scrumSessionUser.findFirst({
		where: { id }
	});
	return user ?? null;
}

export async function updateScrumSessionUser(id: string, input: UpdateScrumSessionUserInput) {
	const [user] = await db
		.update(scrumSessionUser)
		.set({ ...input, updatedAt: new Date() })
		.where(eq(scrumSessionUser.id, id))
		.returning();
	if (user) await touchSession(user.scrumSessionId);
	return user ?? null;
}

export async function deleteScrumSessionUser(id: string) {
	const [user] = await db.delete(scrumSessionUser).where(eq(scrumSessionUser.id, id)).returning();
	if (user) await touchSession(user.scrumSessionId);
	return user ?? null;
}
