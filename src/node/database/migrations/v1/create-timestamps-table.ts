import { sql } from 'kysely';
import type { Migration } from '../migration';

const createTimestampsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('timestamps')
      .ifNotExists()
      .addColumn('name', 'varchar', (col) => col.notNull().unique().primaryKey())
      .addColumn('date', 'text', (col) => col.notNull().defaultTo(sql`(datetime('now'))`))
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createTimestampsTable;
