/**
 * Converts a date value to an ISO string.
 * Handles both Date objects (PostgreSQL) and string values (SQLite).
 */
export function dateToISOString(value: Date | string): string {
  if (typeof value === 'string') {
    return value;
  }
  return value.toISOString();
}
