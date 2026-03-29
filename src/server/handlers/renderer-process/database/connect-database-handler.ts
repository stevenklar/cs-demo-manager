import type { ErrorCode } from 'csdm/common/error-code';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { connectDatabase } from 'csdm/node/database/connect-database';

export type ConnectDatabaseError = {
  code: ErrorCode;
  message: string;
};

export async function connectDatabaseHandler(databasePath: string | undefined) {
  try {
    await connectDatabase(databasePath);
  } catch (error) {
    logger.error('Error while connecting to the database');
    logger.error(error);
    const code = getErrorCodeFromError(error);
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    const payload: ConnectDatabaseError = {
      code,
      message,
    };

    return payload;
  }
}
