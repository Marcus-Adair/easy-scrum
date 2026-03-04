import { eq, count, gt, and, sql } from 'drizzle-orm';
import { db } from '../db';
import { topic, scrumSession, note } from '../db/schema';

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
	const [noteCount] = await db.select({ count: count() }).from(note).where(eq(note.topicId, id));
	// TODO: Consider enforcing this at the DB level by changing note.topicId to onDelete: 'restrict'
	if (noteCount.count > 0) {
		throw new Error('Cannot delete topic with existing notes');
	}
	const [t] = await db.delete(topic).where(eq(topic.id, id)).returning();
	if (t) {
		// Decrement rowIdx for all topics after the deleted one
		await db
			.update(topic)
			.set({ rowIdx: sql`${topic.rowIdx} - 1` })
			.where(and(eq(topic.scrumSessionId, t.scrumSessionId), gt(topic.rowIdx, t.rowIdx)));
		await touchSession(t.scrumSessionId);
	}
	return t ?? null;
}
