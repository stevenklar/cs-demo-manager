// SQLite error codes relevant to the application.
// better-sqlite3 throws SqliteError with a `code` property.
export const SqliteErrorCode = {
  UniqueViolation: 'SQLITE_CONSTRAINT_UNIQUE',
  TableNotFound: 'SQLITE_ERROR',
} as const;

export type SqliteErrorCode = (typeof SqliteErrorCode)[keyof typeof SqliteErrorCode];
