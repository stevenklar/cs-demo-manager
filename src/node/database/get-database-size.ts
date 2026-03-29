import { sql } from 'kysely';
import { db } from './database';

export async function getDatabaseSize(): Promise<string> {
  const pageCountResult = await sql<{ page_count: number }>`PRAGMA page_count`.execute(db);
  const pageSizeResult = await sql<{ page_size: number }>`PRAGMA page_size`.execute(db);

  const pageCount = pageCountResult.rows[0]?.page_count ?? 0;
  const pageSize = pageSizeResult.rows[0]?.page_size ?? 0;
  const sizeInBytes = pageCount * pageSize;

  if (sizeInBytes < 1024) {
    return `${sizeInBytes} bytes`;
  }

  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  }

  if (sizeInBytes < 1024 * 1024 * 1024) {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
