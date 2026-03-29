import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import { parseFile } from '@fast-csv/parse';
import { glob } from 'csdm/node/filesystem/glob';
import type { Database } from 'csdm/node/database/schema';
import { db } from 'csdm/node/database/database';

export type InsertOptions = {
  outputFolderPath: string;
  demoName: string;
};

export function getOutputFolderPath() {
  return path.resolve(os.tmpdir(), 'cs-demo-manager');
}

export function getDemoNameFromPath(demoPath: string) {
  return path.parse(demoPath).name;
}

export function getCsvFilePath(outputFolderPath: string, demoName: string, csvFileSuffix: string) {
  return path.resolve(outputFolderPath, `${demoName}${csvFileSuffix}`);
}

type InsertFromCsvOptions<Table> = {
  csvFilePath: string;
  tableName: keyof Database;
  columns: Array<keyof Table>;
};

function parseCsvRows(csvFilePath: string): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const rows: string[][] = [];
    parseFile(csvFilePath, { headers: false })
      .on('error', reject)
      .on('data', (row: string[]) => {
        rows.push(row);
      })
      .on('end', () => resolve(rows));
  });
}

export async function insertFromCsv<Table>({ columns, csvFilePath, tableName }: InsertFromCsvOptions<Table>) {
  const fileExists = await fs.pathExists(csvFilePath);
  if (!fileExists) {
    return;
  }

  const rows = await parseCsvRows(csvFilePath);
  if (rows.length === 0) {
    return;
  }

  const batchSize = 1000;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const values = batch.map((row) => {
      const obj: Record<string, unknown> = {};
      for (let j = 0; j < columns.length; j++) {
        const value = row[j];
        obj[columns[j] as string] = value === '' ? null : value;
      }
      return obj;
    });

    await db.insertInto(tableName).values(values).execute();
  }
}

export async function deleteCsvFilesInOutputFolder(outputFolderPath: string) {
  const files = await glob('*.csv', {
    cwd: outputFolderPath,
    absolute: true,
  });

  await Promise.all(files.map((csvFile) => fs.remove(csvFile)));
}
