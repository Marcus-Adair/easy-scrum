import { eq } from 'drizzle-orm';
import { db } from '../db';
import { scrumSession, noteCategory } from '../db/schema';

export type CreateScrumSessionInput = {
	name: string;
};

export type UpdateScrumSessionInput = {
	name?: string;
};

export async function createScrumSession(input: CreateScrumSessionInput) {
	const [session] = await db.insert(scrumSession).values(input).returning();

	// Create a default "Note" category for the new session
	await db.insert(noteCategory).values({
		scrumSessionId: session.id,
		categoryName: 'Note',
		color: 'yellow'
	});

	return session;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getScrumSessionById(id: string) {
	if (!UUID_REGEX.test(id)) return null;

	const session = await db.query.scrumSession.findFirst({
		where: { id },
		with: {
			users: true,
			noteCategories: true,
			topics: {
				with: {
					notes: {
						with: {
							comments: {
								with: {
									createdBy: true
								}
							},
							noteCategory: true,
							createdBy: true
						}
					}
				}
			}
		}
	});
	return session ?? null;
}

export async function updateScrumSession(id: string, input: UpdateScrumSessionInput) {
	const [session] = await db
		.update(scrumSession)
		.set({ ...input, updatedAt: new Date() })
		.where(eq(scrumSession.id, id))
		.returning();
	return session ?? null;
}

export async function deleteScrumSession(id: string) {
	const [session] = await db.delete(scrumSession).where(eq(scrumSession.id, id)).returning();
	return session ?? null;
}
