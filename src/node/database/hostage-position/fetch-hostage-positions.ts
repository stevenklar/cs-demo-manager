import { db } from 'csdm/node/database/database';
import { hostagePositionRowToHostagePosition } from './hostage-position-row-to-hostage-position';
import { fillMissingTicks } from 'csdm/common/array/fill-missing-ticks';

export async function fetchHostagePositions(checksum: string, roundNumber: number) {
  const rows = await db
    .selectFrom('hostage_positions')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .where('id', 'in', (qb) => {
      return qb
        .selectFrom('hostage_positions')
        .select((eb) => eb.fn.min('id').as('id'))
        .where('match_checksum', '=', checksum)
        .where('round_number', '=', roundNumber)
        .groupBy(['tick', 'x', 'y', 'z']);
    })
    .orderBy('tick')
    .execute();

  const positions = fillMissingTicks(rows.map(hostagePositionRowToHostagePosition));

  return positions;
}
