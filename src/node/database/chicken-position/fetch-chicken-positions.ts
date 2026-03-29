import { db } from 'csdm/node/database/database';
import { chickenPositionRowToChickenPosition } from './chicken-position-row-to-chicken-position';
import { fillMissingTicks } from 'csdm/common/array/fill-missing-ticks';

export async function fetchChickenPositions(checksum: string, roundNumber: number) {
  const rows = await db
    .selectFrom('chicken_positions')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .where('id', 'in', (qb) => {
      return qb
        .selectFrom('chicken_positions')
        .select((eb) => eb.fn.min('id').as('id'))
        .where('match_checksum', '=', checksum)
        .where('round_number', '=', roundNumber)
        .groupBy(['tick', 'x', 'y', 'z']);
    })
    .orderBy('tick')
    .execute();

  const positions = fillMissingTicks(rows.map(chickenPositionRowToChickenPosition));

  return positions;
}
