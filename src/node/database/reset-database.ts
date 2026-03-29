import { sql } from 'kysely';
import type { Transaction } from 'kysely';
import type { Database } from './schema';

export async function resetDatabase(transaction: Transaction<Database>) {
  // Get all table names from sqlite_master
  const tables = await sql<{
    name: string;
  }>`SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence'`.execute(transaction);

  // Disable foreign keys temporarily to allow dropping tables in any order
  await sql`PRAGMA foreign_keys = OFF`.execute(transaction);

  for (const table of tables.rows) {
    await sql`DROP TABLE IF EXISTS ${sql.ref(table.name)}`.execute(transaction);
  }

  await sql`PRAGMA foreign_keys = ON`.execute(transaction);
}
