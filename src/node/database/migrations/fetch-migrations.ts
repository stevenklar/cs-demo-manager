import { sql } from 'kysely';
import { db } from '../database';

export type Migration = { version: number; date: string };

export async function fetchMigrations(limit: number): Promise<Migration[]> {
  const migrations = await db
    .selectFrom('migrations')
    .select(['schema_version as version', sql<string>`run_at`.as('date')])
    .orderBy('run_at', 'desc')
    .limit(limit)
    .execute();

  return migrations;
}
