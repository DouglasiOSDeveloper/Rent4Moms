import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = resolve(projectRoot, 'src');
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const importPattern = /(?:import\s+(?:[^'"()]*?\s+from\s+)?|export\s+[^'"()]*?\s+from\s+|require\s*\(|import\s*\()\s*['"]([^'"]+)['"]/g;
const prohibitedContent = [
  { label: 'URL Unsplash', pattern: /(?:source\.)?unsplash\.com/i },
  { label: 'código de orçamento demonstrativo antigo', pattern: /ORC-2024/i },
  { label: 'SVG provisório embutido', pattern: /data:image\/svg\+xml/i },
  { label: 'cálculo legado por ShippingZone', pattern: /\bShippingZone\b/ },
];

function normalize(value) { return value.split(sep).join('/'); }
function isRuntimeFile(file) {
  const path = normalize(relative(projectRoot, file));
  if (!path.startsWith('src/')) return false;
  return !path.startsWith('src/test/')
    && !/(?:^|\/)(?:__tests__|fixtures)(?:\/|$)/.test(path)
    && !/(?:^|\/)[^/]+\.(?:test|spec)\.[^.]+$/.test(path);
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

const failures = [];
const mockDirectory = resolve(srcRoot, 'data/mocks');
if ((await stat(mockDirectory).catch(() => null))?.isDirectory()) failures.push('O diretório src/data/mocks ainda existe.');

for (const file of (await listFiles(srcRoot)).filter(isRuntimeFile)) {
  const content = await readFile(file, 'utf8');
  const displayPath = normalize(relative(projectRoot, file));
  for (const match of content.matchAll(importPattern)) {
    const source = match[1];
    if (/(?:^|\/)(?:mocks?|fixtures?)(?:\/|$)/i.test(source) || source.includes('data/mocks')) {
      failures.push(`${displayPath} importa fonte não permitida: ${source}`);
    }
  }
  for (const rule of prohibitedContent) {
    if (rule.pattern.test(content)) failures.push(`${displayPath} contém ${rule.label}.`);
  }
}

if (failures.length > 0) {
  console.error('Etapa J: checklist zero mock do frontend reprovado.');
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}
console.log('Etapa J zero mock: bundle de runtime sem mocks, Unsplash, SVG provisório ou frete legado.');
