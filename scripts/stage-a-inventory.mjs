import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = resolve(projectRoot, process.env.STAGE_A_REPORT_DIR || 'reports/stage-a');
const timestamp = new Date().toISOString().replaceAll(':', '').replaceAll('-', '').replace(/\.\d{3}Z$/, 'Z');
const outputDir = resolve(outputRoot, `frontend-${timestamp}`);
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const importPattern = /(?:import\s+(?:[^'"()]*?\s+from\s+)?|export\s+[^'"()]*?\s+from\s+|require\s*\(|import\s*\()\s*['"]([^'"]+)['"]/g;

function normalizePath(path) { return path.split(sep).join('/'); }
function command(command, args) {
  try { return execFileSync(command, args, { cwd: projectRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return 'unknown'; }
}
async function sha256(path) {
  const content = await readFile(path);
  return createHash('sha256').update(content).digest('hex');
}
async function listFiles(directory) {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); } catch (error) { if (error?.code === 'ENOENT') return []; throw error; }
  const files = [];
  for (const entry of entries) {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolute));
    else files.push(absolute);
  }
  return files;
}
function isRuntimeFile(file) {
  const normalized = normalizePath(relative(projectRoot, file));
  if (!normalized.startsWith('src/')) return false;
  if (normalized.startsWith('src/data/mocks/') || normalized.startsWith('src/test/')) return false;
  return !/(?:^|\/)[^/]+\.(?:test|spec)\.[^.]+$/.test(normalized);
}
function resolvesToMocks(file, source) {
  if (source.includes('data/mocks')) return true;
  if (!source.startsWith('.')) return false;
  const target = normalizePath(resolve(dirname(file), source));
  const mocks = normalizePath(resolve(projectRoot, 'src/data/mocks'));
  return target === mocks || target.startsWith(`${mocks}/`);
}

const packageJson = JSON.parse(await readFile(resolve(projectRoot, 'package.json'), 'utf8'));
const mockRoot = resolve(projectRoot, 'src/data/mocks');
const allSourceFiles = (await listFiles(resolve(projectRoot, 'src'))).filter((file) => sourceExtensions.has(extname(file)));
const runtimeConsumers = [];
for (const file of allSourceFiles.filter(isRuntimeFile)) {
  const content = await readFile(file, 'utf8');
  for (const match of content.matchAll(importPattern)) {
    if (resolvesToMocks(file, match[1])) runtimeConsumers.push({ file: normalizePath(relative(projectRoot, file)), source: match[1] });
  }
}

const mockFiles = [];
for (const file of await listFiles(mockRoot)) {
  const info = await stat(file);
  mockFiles.push({
    file: normalizePath(relative(projectRoot, file)),
    bytes: info.size,
    sha256: await sha256(file),
    origin: 'demonstrative_source',
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  repository: {
    name: packageJson.name,
    version: packageJson.version,
    branch: command('git', ['branch', '--show-current']),
    commit: command('git', ['rev-parse', 'HEAD']),
    node: process.version,
    npm: command(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['--version']),
    packageLockSha256: await sha256(resolve(projectRoot, 'package-lock.json')),
  },
  policy: {
    stage: 'A',
    newRuntimeMockImportsAllowed: false,
    currentRuntimeMockImportsAreTechnicalDebt: runtimeConsumers.length > 0,
  },
  dataOrigins: {
    mockFiles,
    runtimeConsumers,
    realDataSource: 'API/backend; not inferable statically from the frontend repository',
  },
  nextAction: runtimeConsumers.length === 0 && mockFiles.length === 0 ? 'Stage B completed: no runtime mocks remain.' : 'Runtime mock consumers still require removal.',
};

await mkdir(outputDir, { recursive: true });
await writeFile(resolve(outputDir, 'frontend-data-origin-report.json'), `${JSON.stringify(report, null, 2)}\n`);
const markdown = `# Rent4Moms - Inventário de origem de dados do frontend\n\nGerado em: ${report.generatedAt}\n\n## Versões\n\n- Pacote: ${report.repository.name}@${report.repository.version}\n- Branch: ${report.repository.branch}\n- Commit: ${report.repository.commit}\n- Node: ${report.repository.node}\n- npm: ${report.repository.npm}\n- package-lock SHA-256: ${report.repository.packageLockSha256}\n\n## Fontes demonstrativas\n\n${mockFiles.map((item) => `- \`${item.file}\` - ${item.bytes} bytes - \`${item.sha256}\``).join('\n')}\n\n## Consumidores runtime congelados\n\n${runtimeConsumers.length ? runtimeConsumers.map((item) => `- \`${item.file}\` importa \`${item.source}\``).join('\n') : '- Nenhum consumidor runtime.'}\n\n> Relatório histórico da Etapa A. Quando as listas estiverem vazias, a remoção coordenada da Etapa B foi concluída.\n`;
await writeFile(resolve(outputDir, 'frontend-data-origin-report.md'), markdown);
console.log(outputDir);
