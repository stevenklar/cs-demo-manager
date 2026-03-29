import type { Migration } from '../migration';
import { insertDefaultTags } from 'csdm/node/database/tags/insert-default-tags';
import { sqliteDb } from '../../database';

const createTagsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('tags')
      .ifNotExists()
      .addColumn('id', 'integer', (col) => col.primaryKey().notNull())
      .addColumn('name', 'varchar', (col) => col.notNull().unique())
      .addColumn('color', 'varchar', (col) => col.notNull())
      .execute();

    // Use sqliteDb.exec() for triggers because Kysely's sql`` splits on semicolons
    // inside BEGIN...END blocks, which breaks SQLite compound statements.
    sqliteDb.exec(`
      CREATE TRIGGER IF NOT EXISTS tag_deleted
      BEFORE DELETE ON tags
      FOR EACH ROW
      BEGIN
        DELETE FROM checksum_tags WHERE tag_id = OLD.id;
      END
    `);

    await insertDefaultTags(transaction);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createTagsTable;
