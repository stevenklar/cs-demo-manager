import { db } from 'csdm/node/database/database';
import { grenadePositionRowToGrenadePosition } from './grenade-position-row-to-grenade-position';
import { fillMissingTicks } from 'csdm/common/array/fill-missing-ticks';

export async function fetchGrenadePositions(checksum: string, roundNumber: number) {
  const rows = await db
    .selectFrom('grenade_positions')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .where('id', 'in', (qb) => {
      return qb
        .selectFrom('grenade_positions')
        .select((eb) => eb.fn.min('id').as('id'))
        .where('match_checksum', '=', checksum)
        .where('round_number', '=', roundNumber)
        .groupBy(['tick', 'projectile_id']);
    })
    .orderBy('tick')
    .execute();
  const grenadePositions = fillMissingTicks(rows.map(grenadePositionRowToGrenadePosition));

  return grenadePositions;
}
