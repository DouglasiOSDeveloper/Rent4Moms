import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = resolve(projectRoot, 'src');
const mockRoot = resolve(srcRoot, 'data/mocks');
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const importPattern = /(?:import\s+(?:[^'"()]*?\s+from\s+)?|export\s+[^'"()]*?\s+from\s+|require\s*\(|import\s*\()\s*['"]([^'"]+)['"]/g;

function normalizePath(path) { return path.split(sep).join('/'); }
function isRuntimeFile(file) {
  const normalized = normalizePath(relative(projectRoot, file));
  if (!normalized.startsWith('src/') || normalized.startsWith('src/test/')) return false;
  return !/(?:^|\/)[^/]+\.(?:test|spec)\.[^.]+$/.test(normalized);
}
async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolute));
    else if (sourceExtensions.has(extname(entry.name))) files.push(absolute);
  }
  return files;
}
function resolvesToMocks(file, source) {
  if (source.includes('data/mocks')) return true;
  if (!source.startsWith('.')) return false;
  const target = normalizePath(resolve(dirname(file), source));
  const mocks = normalizePath(mockRoot);
  return target === mocks || target.startsWith(`${mocks}/`);
}

const found = [];
for (const file of (await listFiles(srcRoot)).filter(isRuntimeFile)) {
  const content = await readFile(file, 'utf8');
  for (const match of content.matchAll(importPattern)) {
    if (resolvesToMocks(file, match[1])) found.push({ file: normalizePath(relative(projectRoot, file)), source: match[1] });
  }
}

let mockDirectoryExists = true;
try { await access(mockRoot); } catch { mockDirectoryExists = false; }

if (found.length > 0 || mockDirectoryExists) {
  console.error('Stage B exige remoção total dos mocks de runtime.');
  if (mockDirectoryExists) console.error('- O diretório src/data/mocks ainda existe.');
  for (const item of found) console.error(`- ${item.file} -> ${item.source}`);
  process.exit(1);
}

console.log('Stage B mock guard: nenhum mock de runtime e nenhum diretório src/data/mocks.');
