import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';
import { relations } from './schema';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export const db = drizzle({
	connection: env.DATABASE_URL!,
	schema,
	relations
});
