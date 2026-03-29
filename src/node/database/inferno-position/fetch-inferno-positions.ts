import type { InfernoPosition } from 'csdm/common/types/inferno-position';
import { db } from 'csdm/node/database/database';
import { infernoPositionRowToInfernoPosition } from './inferno-position-row-to-inferno-position';
import { fillMissingTicks } from 'csdm/common/array/fill-missing-ticks';

export async function fetchInfernoPositions(checksum: string, roundNumber: number) {
  const rows = await db
    .selectFrom('inferno_positions')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .where('id', 'in', (qb) => {
      return qb
        .selectFrom('inferno_positions')
        .select((eb) => eb.fn.min('id').as('id'))
        .where('match_checksum', '=', checksum)
        .where('round_number', '=', roundNumber)
        .groupBy(['tick', 'unique_id']);
    })
    .orderBy('tick')
    .execute();
  const infernoPositions: InfernoPosition[] = fillMissingTicks(rows.map(infernoPositionRowToInfernoPosition));

  return infernoPositions;
}
