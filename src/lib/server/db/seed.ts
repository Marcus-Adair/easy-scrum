import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const db = drizzle({
	connection: DATABASE_URL,
	schema
});

async function seed() {
	console.log('Seeding database...');

	// Create a session
	const [session] = await db
		.insert(schema.scrumSession)
		.values({ name: 'Demo Sprint Board' })
		.returning();
	console.log('Created session:', session.name);

	// Create users
	const [user1] = await db
		.insert(schema.scrumSessionUser)
		.values({ name: 'Alice', scrumSessionId: session.id })
		.returning();
	const [user2] = await db
		.insert(schema.scrumSessionUser)
		.values({ name: 'Bob', password: 'secret123', scrumSessionId: session.id })
		.returning();
	console.log('Created users:', user1.name, user2.name);

	// Create note categories
	const [categoryBug] = await db
		.insert(schema.noteCategory)
		.values({ scrumSessionId: session.id, categoryName: 'Bug', color: 'yellow' })
		.returning();
	const [categoryFeature] = await db
		.insert(schema.noteCategory)
		.values({ scrumSessionId: session.id, categoryName: 'Feature', color: 'pink' })
		.returning();
	const [categoryChore] = await db
		.insert(schema.noteCategory)
		.values({ scrumSessionId: session.id, categoryName: 'Chore', color: 'salmon' })
		.returning();
	console.log('Created categories:', categoryBug.categoryName, categoryFeature.categoryName, categoryChore.categoryName);

	// Create topics
	const [topicTodo] = await db
		.insert(schema.topic)
		.values({ scrumSessionId: session.id, topicName: 'To Do', color: 'yellow', rowIdx: 0 })
		.returning();
	const [topicInProgress] = await db
		.insert(schema.topic)
		.values({ scrumSessionId: session.id, topicName: 'In Progress', color: 'blue', rowIdx: 1 })
		.returning();
	const [topicDone] = await db
		.insert(schema.topic)
		.values({ scrumSessionId: session.id, topicName: 'Done', color: 'orange', rowIdx: 2 })
		.returning();
	console.log('Created topics:', topicTodo.topicName, topicInProgress.topicName, topicDone.topicName);

	// Create notes
	const [note1] = await db
		.insert(schema.note)
		.values({
			header: 'Fix login bug',
			notes: 'Users are getting logged out randomly after 5 minutes',
			topicId: topicTodo.id,
			noteCategoryId: categoryBug.id,
			colIdx: 0
		})
		.returning();
	const [note2] = await db
		.insert(schema.note)
		.values({
			header: 'Add dark mode',
			notes: 'Implement dark mode toggle in settings',
			topicId: topicTodo.id,
			noteCategoryId: categoryFeature.id,
			colIdx: 1
		})
		.returning();
	const [note3] = await db
		.insert(schema.note)
		.values({
			header: 'Update dependencies',
			notes: 'Run npm update and fix any breaking changes',
			topicId: topicInProgress.id,
			noteCategoryId: categoryChore.id,
			colIdx: 0
		})
		.returning();
	const [note4] = await db
		.insert(schema.note)
		.values({
			header: 'Setup CI/CD',
			notes: 'Configure GitHub Actions for automated testing',
			topicId: topicDone.id,
			noteCategoryId: categoryChore.id,
			colIdx: 0
		})
		.returning();
	console.log('Created notes:', note1.header, note2.header, note3.header, note4.header);

	// Create comments
	await db.insert(schema.comment).values({
		content: 'I can reproduce this on Chrome and Firefox',
		noteId: note1.id
	});
	await db.insert(schema.comment).values({
		content: 'Might be related to the session timeout setting',
		noteId: note1.id
	});
	await db.insert(schema.comment).values({
		content: 'Should we use CSS variables or a library for this?',
		noteId: note2.id
	});
	console.log('Created comments');

	console.log('\nSeeding complete!');
	console.log(`Session ID: ${session.id}`);
	console.log(`Visit: http://localhost:5173/${session.id}`);
}

seed().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
