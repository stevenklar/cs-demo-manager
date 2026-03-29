import { db } from 'csdm/node/database/database';
import { dateToISOString } from 'csdm/node/database/date-to-iso-string';
import type { BannedSteamAccount } from 'csdm/common/types/banned-steam-account';

export async function fetchBannedSteamAccounts(ignoreBanBeforeFirstSeen: boolean) {
  const { ref } = db.dynamic;
  let query = db
    .selectFrom('steam_accounts')
    .select(['steam_accounts.steam_id', 'steam_accounts.avatar', 'steam_accounts.name', 'steam_accounts.last_ban_date'])
    .where('steam_accounts.last_ban_date', 'is not', null)
    .where('steam_accounts.steam_id', 'not in', (qb) => {
      return qb.selectFrom('ignored_steam_accounts').select('ignored_steam_accounts.steam_id');
    })
    .leftJoin('players', 'players.steam_id', 'steam_accounts.steam_id')
    .select((eb) => eb.fn.max('players.rank').as('rank'))
    .leftJoin('demos', 'demos.checksum', 'players.match_checksum')
    .select((eb) => eb.fn.max('demos.date').as('match_date'))
    .groupBy(['steam_accounts.steam_id', 'steam_accounts.avatar', 'steam_accounts.name', 'steam_accounts.last_ban_date'])
    .orderBy('steam_accounts.last_ban_date', 'desc')
    .orderBy('steam_accounts.steam_id', 'asc');

  if (ignoreBanBeforeFirstSeen) {
    query = query.whereRef('steam_accounts.last_ban_date', '>=', ref('demos.date'));
  }

  const rows = await query.execute();
  const bannedAccounts = rows.map<BannedSteamAccount>((row) => {
    return {
      steamId: row.steam_id,
      name: row.name,
      avatar: row.avatar,
      lastBanDate: row.last_ban_date ? dateToISOString(row.last_ban_date) : '',
      rank: row.rank ?? 0,
    };
  });

  return bannedAccounts;
}
