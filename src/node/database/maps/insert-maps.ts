import { db } from 'csdm/node/database/database';
import { isSqliteUniqueViolation } from 'csdm/node/database/is-sqlite-unique-violation';
import { MapAlreadyExists } from './errors/map-already-exists';
import type { InsertableMap } from './map-table';

export async function insertMaps(maps: InsertableMap[]) {
  try {
    const insertedMaps = await db.insertInto('maps').values(maps).returningAll().execute();

    return insertedMaps;
  } catch (error) {
    if (isSqliteUniqueViolation(error)) {
      throw new MapAlreadyExists();
    }

    throw error;
  }
}
