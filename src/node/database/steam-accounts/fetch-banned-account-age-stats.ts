import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';

export async function fetchBannedAccountAgeStats(ignoreBanBeforeFirstSeen: boolean) {
  let query = db
    .selectFrom('steam_accounts')
    .select([
      sql<string | null>`datetime('now', '-' || CAST(AVG(julianday('now') - julianday(creation_date)) AS INTEGER) || ' days')`.as('average'),
    ])
    .where('steam_accounts.last_ban_date', 'is not', null)
    .where('steam_accounts.creation_date', 'is not', null)
    .leftJoin('players', 'players.steam_id', 'steam_accounts.steam_id')
    .leftJoin('demos', 'demos.checksum', 'players.match_checksum');

  if (ignoreBanBeforeFirstSeen) {
    const { ref } = db.dynamic;
    query = query.whereRef('steam_accounts.last_ban_date', '>=', ref('demos.date'));
  }

  const result = await query.executeTakeFirst();

  return {
    average: result?.average ?? null,
    median: null,
  };
}
