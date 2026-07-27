import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', dist), 'utf8');
const failures = [];

function normalizeBasePath(value) {
  const trimmed = value?.trim();
  if (!trimmed) return '/';
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

const expectedBasePath = normalizeBasePath(process.env.VITE_BASE_PATH);
for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  const url = match[1];
  if (url.startsWith('/') && !url.startsWith(expectedBasePath)) {
    failures.push(`local URL does not use the configured base path ${expectedBasePath}: ${url}`);
  }
}

if (!html.includes('lang="pt-BR"')) failures.push('index.html must declare lang="pt-BR"');
if (!html.includes('Rent4Moms')) failures.push('index.html must contain the Rent4Moms title');
if (/noindex/i.test(html)) failures.push('production build must not contain noindex');

const assetsDir = new URL('assets/', dist);
const assetsPath = fileURLToPath(assetsDir);
const assets = await readdir(assetsPath);
let javascriptBytes = 0;
for (const asset of assets) {
  const details = await stat(join(assetsPath, asset));
  if (asset.endsWith('.js')) javascriptBytes += details.size;
  if (asset.endsWith('.map')) failures.push(`source map published unexpectedly: ${asset}`);
}

const maxJavascriptBytes = 2_500_000;
if (javascriptBytes > maxJavascriptBytes) {
  failures.push(`JavaScript output is ${javascriptBytes} bytes; limit is ${maxJavascriptBytes}`);
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`Production build verified (${javascriptBytes} JavaScript bytes).`);
