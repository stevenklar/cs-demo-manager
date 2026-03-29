import path from 'node:path';
import { createDatabaseConnection } from 'csdm/node/database/database';
import { getSettings } from 'csdm/node/settings/get-settings';
import { migrateDatabase } from 'csdm/node/database/migrations/migrate-database';
import { startBackgroundTasks } from 'csdm/server/start-background-tasks';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';

export function getDefaultDatabasePath() {
  return path.join(getAppFolderPath(), 'cs-demo-manager.db');
}

export async function connectDatabase(databasePath?: string | undefined) {
  if (databasePath === undefined || databasePath === '') {
    const settings = await getSettings();
    databasePath = settings.database.databasePath;
  }

  if (databasePath === undefined || databasePath === '') {
    databasePath = getDefaultDatabasePath();
  }

  createDatabaseConnection(databasePath);
  await migrateDatabase();
  startBackgroundTasks();
}
