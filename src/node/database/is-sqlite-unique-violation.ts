import { SqliteErrorCode } from './sqlite-error-code';

export function isSqliteUniqueViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === SqliteErrorCode.UniqueViolation;
}
