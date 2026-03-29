import { sql } from 'kysely';
import type { Migration } from '../migration';

const createDownloadHistoryTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('download_history')
      .ifNotExists()
      .addColumn('match_id', 'varchar', (col) => col.primaryKey())
      .addColumn('downloaded_at', 'text', (col) => col.notNull().defaultTo(sql`(datetime('now'))`))
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createDownloadHistoryTable;
