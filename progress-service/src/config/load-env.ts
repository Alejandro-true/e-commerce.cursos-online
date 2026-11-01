import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Loads simple KEY=value pairs from the service's local .env file. */
export function loadEnvFile(filePath = resolve(process.cwd(), '.env')): void {
  if (!existsSync(filePath)) return;

  const contents = readFileSync(filePath, 'utf8');
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator < 1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile();
