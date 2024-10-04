import 'dotenv/config'

import { migrate } from 'drizzle-orm/postgres-js/migrator'

import { client, db } from './index'

async function run() {
  // This will run migrations on the database, skipping the ones already applied
  await migrate(db, { migrationsFolder: './supabase/migrations' })

  // Don't forget to close the connection, otherwise the script will hang
  await client.end()
}

run()
