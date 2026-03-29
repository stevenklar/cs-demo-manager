import React, { useState, useEffect, useCallback } from 'react';
import { Trans } from '@lingui/react/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useUpdateSettings } from 'csdm/ui/settings/use-update-settings';
import { AppWrapper } from '../app-wrapper';
import { AppContent } from '../app-content';
import { connectDatabaseError, connectDatabaseSuccess } from '../bootstrap-actions';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useBootstrapState } from '../use-bootstrap-state';
import type { ConnectDatabaseError } from 'csdm/server/handlers/renderer-process/database/connect-database-handler';
import { ErrorCode } from 'csdm/common/error-code';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { ButtonVariant } from 'csdm/ui/components/buttons/button';
import { ResetDatabaseButton } from 'csdm/ui/settings/database/reset-database-button';
import { ConnectDatabaseButton } from 'csdm/ui/bootstrap/connect-database/connect-database-button';

function DatabaseSchemaVersionMismatch() {
  return (
    <div>
      <p>
        <Trans>
          It looks like you installed an older version of CS Demo Manager and the current database schema is not
          compatible with it.
        </Trans>
      </p>
      <p>
        <Trans>
          You can either update CS Demo Manager to the latest version or reset the database to start from scratch.
        </Trans>
      </p>

      <div className="mt-8">
        <ResetDatabaseButton variant={ButtonVariant.Danger} />
      </div>
    </div>
  );
}

function getHintFromError({ code, message }: ConnectDatabaseError) {
  switch (code) {
    case ErrorCode.DatabaseSchemaVersionMismatch:
      return <DatabaseSchemaVersionMismatch />;
  }

  return (
    <p>
      <Trans>An unexpected error occurred while connecting to the database.</Trans>
    </p>
  );
}

export function ConnectDatabase() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const updateSettings = useUpdateSettings();
  const { error } = useBootstrapState();
  const [isConnecting, setIsConnecting] = useState(false);

  const connectDatabase = useCallback(async () => {
    setIsConnecting(true);
    const error = await client.send({
      name: RendererClientMessageName.ConnectDatabase,
      payload: undefined,
    });
    if (error) {
      setIsConnecting(false);
      dispatch(connectDatabaseError({ error }));
    } else {
      dispatch(connectDatabaseSuccess());
    }

    return error;
  }, [client, dispatch]);

  useEffect(() => {
    connectDatabase();
  }, [connectDatabase]);

  const renderError = () => {
    if (!error) {
      return null;
    }

    const hint = getHintFromError(error);
    return (
      <div className="m-auto mt-8 flex max-w-[600px] flex-col">
        <ErrorMessage message={<Trans>The connection to the database failed with the following error:</Trans>} />
        <p className="my-8 text-body-strong select-text">{error.message}</p>
        {hint}
      </div>
    );
  };

  if (!error) {
    return (
      <AppWrapper>
        <AppContent>
          <div className="m-auto flex flex-col items-center gap-y-8">
            <p>
              <Trans>Connecting to database...</Trans>
            </p>
          </div>
        </AppContent>
      </AppWrapper>
    );
  }

  return (
    <AppWrapper>
      <AppContent>
        <div className="m-auto flex flex-col">
          <div className="m-auto flex w-[400px] flex-col">
            {renderError()}
            <div className="mt-12">
              <ConnectDatabaseButton isLoading={isConnecting} onClick={connectDatabase} />
            </div>
          </div>
        </div>
      </AppContent>
    </AppWrapper>
  );
}
