import React from 'react';
import { Trans } from '@lingui/react/macro';
import { DisconnectDatabaseButton } from './disconnect-database-button';
import { useDatabaseSettings } from './use-database-settings';

export function Database() {
  const { databasePath } = useDatabaseSettings();

  return (
    <div className="flex max-w-[400px] flex-col gap-y-8">
      <div>
        <p className="text-body-strong">
          <Trans>Database path</Trans>
        </p>
        <p className="mt-4 select-text break-all">{databasePath || <Trans>Default location</Trans>}</p>
      </div>
      <div className="mt-12">
        <DisconnectDatabaseButton />
      </div>
    </div>
  );
}
