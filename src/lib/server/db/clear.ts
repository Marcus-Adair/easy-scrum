import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const db = drizzle({
	connection: DATABASE_URL,
	schema
});

async function clear() {
	console.log('Clearing database...');

	// Delete in order: children first, then parents
	await db.delete(schema.comment);
	console.log('Cleared comments');

	await db.delete(schema.note);
	console.log('Cleared notes');

	await db.delete(schema.topic);
	console.log('Cleared topics');

	await db.delete(schema.noteCategory);
	console.log('Cleared note categories');

	await db.delete(schema.scrumSessionUser);
	console.log('Cleared users');

	await db.delete(schema.scrumSession);
	console.log('Cleared sessions');

	console.log('\nDatabase cleared!');
}

clear().catch((err) => {
	console.error('Clear failed:', err);
	process.exit(1);
});
