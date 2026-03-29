import { sql } from 'kysely';
import type { PlayerChartsData } from 'csdm/common/types/charts/player-charts-data';
import { db } from 'csdm/node/database/database';
import { applyMatchFilters, type MatchFilters } from '../match/apply-match-filters';

export async function fetchPlayerChartsData(steamId: string, filters: MatchFilters): Promise<PlayerChartsData[]> {
  let query = db
    .selectFrom('players')
    .select([
      'headshot_percentage as headshotPercentage',
      'average_damage_per_round as averageDamagePerRound',
      'kill_death_ratio as killDeathRatio',
    ])
    .innerJoin('matches', 'matches.checksum', 'players.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .select(sql<string>`demos.date`.as('matchDate'))
    .leftJoin('clutches', function (qb) {
      return qb
        .onRef('clutches.match_checksum', '=', 'players.match_checksum')
        .onRef('players.steam_id', '=', 'clutches.clutcher_steam_id');
    })
    .select([
      sql<number>`ROUND(SUM(CASE WHEN clutches.won = TRUE THEN 1 ELSE 0 END) * 100.0 / MAX(COUNT(clutches.id), 1), 1)`.as(
        'clutchWonPercentage',
      ),
    ])
    .where('steam_id', '=', steamId)
    .groupBy(['headshotPercentage', 'averageDamagePerRound', 'killDeathRatio', 'demos.date'])
    .orderBy('date', 'asc');

  query = applyMatchFilters(query, filters);

  const data: PlayerChartsData[] = await query.execute();

  return data;
}
