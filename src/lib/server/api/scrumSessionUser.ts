import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { scrumSessionUser, scrumSession } from '../db/schema';

export type CreateScrumSessionUserInput = {
	name: string;
	password?: string;
	scrumSessionId: string;
};

async function touchSession(sessionId: string) {
	await db.update(scrumSession).set({ updatedAt: new Date() }).where(eq(scrumSession.id, sessionId));
}

export async function createScrumSessionUser(input: CreateScrumSessionUserInput) {
	const [user] = await db.insert(scrumSessionUser).values(input).returning();
	await touchSession(input.scrumSessionId);
	return user;
}

export async function getScrumSessionUserByName(scrumSessionId: string, name: string) {
	const [user] = await db
		.select()
		.from(scrumSessionUser)
		.where(and(eq(scrumSessionUser.scrumSessionId, scrumSessionId), eq(scrumSessionUser.name, name)));
	return user ?? null;
}
