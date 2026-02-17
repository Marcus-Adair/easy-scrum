import { eq } from 'drizzle-orm';
import { db } from '../db';
import { topic, scrumSession } from '../db/schema';

export type CreateTopicInput = {
	scrumSessionId: string;
	topicName: string;
	color: string;
	rowIdx: number;
};

export type UpdateTopicInput = {
	topicName?: string;
	color?: string;
	rowIdx?: number;
};

async function touchSession(sessionId: string) {
	await db.update(scrumSession).set({ updatedAt: new Date() }).where(eq(scrumSession.id, sessionId));
}

export async function createTopic(input: CreateTopicInput) {
	const [newTopic] = await db.insert(topic).values(input).returning();
	await touchSession(input.scrumSessionId);
	return newTopic;
}

export async function getTopicById(id: string) {
	const t = await db.query.topic.findFirst({
		where: { id },
		with: {
			notes: {
				with: {
					comments: true,
					noteCategory: true
				}
			}
		}
	});
	return t ?? null;
}

export async function updateTopic(id: string, input: UpdateTopicInput) {
	const [t] = await db
		.update(topic)
		.set({ ...input, updatedAt: new Date() })
		.where(eq(topic.id, id))
		.returning();
	if (t) await touchSession(t.scrumSessionId);
	return t ?? null;
}

export async function deleteTopic(id: string) {
	const [t] = await db.delete(topic).where(eq(topic.id, id)).returning();
	if (t) await touchSession(t.scrumSessionId);
	return t ?? null;
}
