import { sql, type ExpressionBuilder } from 'kysely';
import type { Migration } from '../migration';
import type { Database } from '../../schema';
import { sqliteDb } from '../../database';

const createSteamAccountsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('steam_accounts')
      .ifNotExists()
      .addColumn('steam_id', 'varchar', (col) => col.primaryKey().notNull())
      .addColumn('name', 'varchar', (col) => col.notNull())
      .addColumn('avatar', 'varchar', (col) => col.notNull())
      .addColumn('last_ban_date', 'text')
      .addColumn('is_community_banned', 'boolean', (col) => col.notNull())
      .addColumn('has_private_profile', 'boolean', (col) => col.notNull())
      .addColumn('vac_ban_count', 'integer', (col) => col.notNull())
      .addColumn('game_ban_count', 'integer', (col) => col.notNull())
      .addColumn('economy_ban', 'varchar', (col) => col.notNull())
      .addColumn('creation_date', 'text')
      .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(sql`(datetime('now'))`))
      .addColumn('updated_at', 'text', (col) => col.notNull().defaultTo(sql`(datetime('now'))`))
      .execute();

    // Use sqliteDb.exec() for triggers because Kysely's sql`` splits on semicolons
    // inside BEGIN...END blocks, which breaks SQLite compound statements.
    sqliteDb.exec(`
      CREATE TRIGGER IF NOT EXISTS steam_account_deleted
      BEFORE DELETE ON steam_accounts
      FOR EACH ROW
      BEGIN
        DELETE FROM ignored_steam_accounts WHERE steam_id = OLD.steam_id;
      END
    `);

    sqliteDb.exec(`
      CREATE TRIGGER IF NOT EXISTS update_steam_account_updated_at
      AFTER UPDATE ON steam_accounts
      FOR EACH ROW
      BEGIN
        UPDATE steam_accounts SET updated_at = datetime('now') WHERE steam_id = NEW.steam_id;
      END
    `);

    await sql`DROP VIEW IF EXISTS player_ban_per_match`.execute(transaction);

    await transaction.schema
      .createView('player_ban_per_match')
      .as(
        transaction
          .with('match_steam_ids_with_date', (qb) => {
            return (
              qb
                .selectFrom('matches')
                // @ts-expect-error The date column has been removed from the matches table in the v12 migration.
                // Since the v12 migration, the date for both matches and demos is stored in the demos table to serve as
                // a single source of truth.
                .select(['matches.checksum', 'matches.date as match_date'])
                .leftJoin('players', 'matches.checksum', 'players.match_checksum')
                .select(['players.steam_id'])
            );
          })
          .selectFrom('match_steam_ids_with_date')
          .select([
            'checksum as match_checksum',
            sql`SUM(CASE WHEN steam_accounts.last_ban_date IS NULL THEN 0 ELSE 1 END)`.as('player_ban_count'),
          ])
          .leftJoin('steam_accounts', 'steam_accounts.steam_id', 'match_steam_ids_with_date.steam_id')
          .whereRef('steam_accounts.last_ban_date', '>=', 'match_steam_ids_with_date.match_date')
          .where('steam_accounts.steam_id', 'not in', (qb: ExpressionBuilder<Database, 'ignored_steam_accounts'>) => {
            return qb.selectFrom('ignored_steam_accounts').select('steam_id');
          })
          .groupBy(['match_steam_ids_with_date.checksum']),
      )
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createSteamAccountsTable;
