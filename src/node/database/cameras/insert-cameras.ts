import crypto from 'node:crypto';
import { db } from 'csdm/node/database/database';
import type { InsertableCamera } from './cameras-table';
import { isSqliteUniqueViolation } from 'csdm/node/database/is-sqlite-unique-violation';
import { CameraAlreadyExists } from './errors/camera-already-exists';

export async function insertCamera(camera: InsertableCamera) {
  try {
    const cameraWithId = {
      id: crypto.randomUUID(),
      ...camera,
    };
    const rows = await db.insertInto('cameras').values(cameraWithId).returningAll().execute();

    if (rows.length === 0) {
      throw new Error('Failed to insert camera');
    }

    return rows[0];
  } catch (error) {
    if (isSqliteUniqueViolation(error)) {
      throw new CameraAlreadyExists();
    }

    throw error;
  }
}
