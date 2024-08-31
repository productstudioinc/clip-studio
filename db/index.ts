import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!, {
	connect_timeout: 30, // Set a timeout of 10 seconds
	onnotice: () => {} // Ignore notice messages
});

let db;
try {
	db = drizzle(client, { schema });
} catch (error) {
	console.error('Failed to connect to the database:', error);
	// You might want to handle this error more gracefully in a production environment
}

export { db };
