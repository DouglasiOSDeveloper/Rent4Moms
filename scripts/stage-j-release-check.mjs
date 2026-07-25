import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
  'docs/STAGE_J.md',
  'docs/RELEASE_CHECKLIST.md',
  'docs/DEPLOYMENT.md',
  'docs/ACCESSIBILITY.md',
  'scripts/stage-j-zero-mock-check.mjs',
  'scripts/stage-j-release-check.mjs',
  'scripts/verify-build.mjs',
  'src/app/App.smoke.test.tsx',
  'src/app/accessibility.test.tsx',
  'src/app/ErrorBoundary.test.tsx',
  'public/_headers',
  'public/_redirects',
  'public/robots.txt',
];
const failures = [];
for (const file of requiredFiles) {
  if (!(await stat(resolve(projectRoot, file)).catch(() => null))?.isFile()) failures.push(`arquivo obrigatório ausente: ${file}`);
}

const packageJson = JSON.parse(await readFile(resolve(projectRoot, 'package.json'), 'utf8'));
for (const script of ['stage:j:zero-mock', 'stage:j:static', 'stage:j:verify', 'qa:production', 'verify:dist']) {
  if (!packageJson.scripts?.[script]) failures.push(`script npm ausente: ${script}`);
}
const workflow = await readFile(resolve(projectRoot, '.github/workflows/ci.yml'), 'utf8');
if (!workflow.includes('npm run stage:j:verify')) failures.push('CI não executa stage:j:verify');
if (!workflow.includes('rent4moms-frontend-dist')) failures.push('CI não publica o artefato dist');

const distRoot = resolve(projectRoot, 'dist');
if (!(await stat(distRoot).catch(() => null))?.isDirectory()) {
  failures.push('dist ausente; execute o build antes do gate da Etapa J');
} else {
  const html = await readFile(resolve(distRoot, 'index.html'), 'utf8').catch(() => '');
  if (!html.includes('lang="pt-BR"')) failures.push('dist/index.html não declara pt-BR');
  if (!html.includes('Rent4Moms')) failures.push('dist/index.html não contém o título Rent4Moms');
  const assets = await readdir(resolve(distRoot, 'assets')).catch(() => []);
  const runtimeAssets = assets.filter((name) => /\.(?:js|css)$/.test(name));
  for (const asset of runtimeAssets) {
    const content = await readFile(resolve(distRoot, 'assets', asset), 'utf8');
    if (/(?:source\.)?unsplash\.com|ORC-2024|PHN2ZyB3aWR0aD0iODgi|Error loading image|data\/mocks/i.test(content)) {
      failures.push(`artefato contém marcador não permitido: assets/${asset}`);
    }
    if (/VITE_API_BASE_URL/.test(content)) failures.push(`variável Vite não resolvida em assets/${asset}`);
  }
  if (assets.some((name) => name.endsWith('.map'))) failures.push('source map encontrado em dist/assets');
}

if (failures.length > 0) {
  console.error('Etapa J: artefato de publicação reprovado.');
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}
console.log('Etapa J: artefato, smoke tests, acessibilidade, headers, rotas SPA e CI prontos para homologação.');
