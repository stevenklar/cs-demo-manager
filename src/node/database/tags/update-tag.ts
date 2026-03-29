import { db } from 'csdm/node/database/database';
import { isSqliteUniqueViolation } from 'csdm/node/database/is-sqlite-unique-violation';
import { assertValidTag } from './assert-valid-tag';
import { TagNameAlreadyTaken } from './errors/tag-name-already-taken';
import type { Tag } from '../../../common/types/tag';

export async function updateTag(tag: Tag) {
  assertValidTag(tag);

  try {
    await db.updateTable('tags').set(tag).where('id', '=', tag.id).execute();
  } catch (error) {
    if (isSqliteUniqueViolation(error)) {
      throw new TagNameAlreadyTaken();
    }
    throw error;
  }
}
