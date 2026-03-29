import Database from 'better-sqlite3';
import type { KyselyConfig, LogEvent, Logger } from 'kysely';
import { Kysely, SqliteDialect } from 'kysely';
import type { Database as DatabaseSchema } from './schema';

export let db: Kysely<DatabaseSchema>;
export let sqliteDb: Database.Database;

function serializeValue(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  return value;
}

function serializeArgs(args: unknown[]): unknown[] {
  return args.map((arg) => {
    if (Array.isArray(arg)) {
      return arg.map(serializeValue);
    }
    return serializeValue(arg);
  });
}

function createSerializingProxy(database: Database.Database): Database.Database {
  return new Proxy(database, {
    get(target, prop, receiver) {
      if (prop === 'prepare') {
        return (source: string) => {
          const stmt = target.prepare(source);
          return new Proxy(stmt, {
            get(stmtTarget, stmtProp, stmtReceiver) {
              const value = Reflect.get(stmtTarget, stmtProp, stmtReceiver);
              if (typeof value === 'function' && (stmtProp === 'run' || stmtProp === 'get' || stmtProp === 'all')) {
                return (...args: unknown[]) => {
                  return value.apply(stmtTarget, serializeArgs(args));
                };
              }
              return value;
            },
          });
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

export function createDatabaseConnection(databasePath: string) {
  const sqlite = new Database(databasePath);

  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('synchronous = NORMAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('cache_size = -64000');
  sqlite.pragma('temp_store = MEMORY');

  sqliteDb = sqlite;

  const dialect = new SqliteDialect({
    database: createSerializingProxy(sqlite),
  });

  let loggerFunction: Logger;
  if (process.env.LOG_DATABASE_QUERIES) {
    loggerFunction = (event: LogEvent) => {
      logger.log(event.query.sql);
      logger.log(event.query.parameters);
      if (event.level === 'error') {
        logger.log('Failed query:');
        logger.error(event.error);
      }
    };
  } else {
    loggerFunction = (event: LogEvent) => {
      if (event.level === 'error') {
        logger.log('Failed query:');
        logger.error(event.error);
      }
    };
  }

  const config: KyselyConfig = {
    dialect,
    log: loggerFunction,
  };

  db = new Kysely<DatabaseSchema>(config);
}

export function closeDatabaseConnection() {
  sqliteDb?.close();
}
