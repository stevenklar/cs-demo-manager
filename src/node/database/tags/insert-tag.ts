import { db } from 'csdm/node/database/database';
import { isSqliteUniqueViolation } from 'csdm/node/database/is-sqlite-unique-violation';
import { assertValidTag } from './assert-valid-tag';
import { TagNameAlreadyTaken } from './errors/tag-name-already-taken';
import { tagRowToTag } from './tag-row-to-tag';
import type { InsertableTag } from './tag-table';

export async function insertTag(tag: InsertableTag) {
  assertValidTag(tag);

  try {
    const rows = await db.insertInto('tags').values(tag).returningAll().execute();
    const newTag = tagRowToTag(rows[0]);

    return newTag;
  } catch (error) {
    if (isSqliteUniqueViolation(error)) {
      throw new TagNameAlreadyTaken();
    }
    throw error;
  }
}
