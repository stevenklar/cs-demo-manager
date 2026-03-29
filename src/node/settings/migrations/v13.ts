import type { Settings } from '../settings';
import type { Migration } from '../migration';

const v13: Migration = {
  schemaVersion: 13,
  run: (settings: Settings) => {
    // Migrate from PostgreSQL database settings (hostname/port/username/password/database)
    // to SQLite settings (databasePath). Old settings are discarded; a default path will be used.
    settings.database = {
      databasePath: '',
    };

    return Promise.resolve(settings);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v13;
