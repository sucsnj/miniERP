import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { spawn } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);

function loadEnvFile(filePath, override = false) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    let value = rawValue.trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
loadEnvFile(resolve(projectRoot, '.env'));
loadEnvFile(resolve(projectRoot, '.env.local'), true);

const [command, ...extraArgs] = process.argv.slice(2);
const port = process.env.PORT || '3000';

if (!command) {
  console.error('Uso: node scripts/run-next.mjs <dev|start> [extra args]');
  process.exit(1);
}

const child = spawn(
  process.execPath,
  [require.resolve('next/dist/bin/next'), command, '--port', port, ...extraArgs],
  {
    stdio: 'inherit',
    env: process.env,
  }
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});