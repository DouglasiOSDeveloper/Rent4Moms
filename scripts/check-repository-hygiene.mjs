import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';

function trackedFiles() {
  const output = execFileSync('git', ['ls-files', '-z'], {
    encoding: 'buffer',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return output.toString('utf8').split('\0').filter(Boolean);
}

const forbiddenPaths = [
  { test: (path) => /(^|\/)\.env(?:\.|$)/.test(path) && !path.endsWith('.env.example'), reason: 'arquivo de ambiente real' },
  { test: (path) => path.startsWith('reports/') && path !== 'reports/.gitkeep', reason: 'relatório gerado' },
  { test: (path) => /\.(?:dump|backup|bak|sqlite3?|db|pem|key|p12|pfx)$/i.test(path), reason: 'backup, banco ou chave privada' },
];

const secretPatterns = [
  { name: 'chave privada', regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
  { name: 'AWS access key', regex: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { name: 'token do GitHub', regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
  { name: 'Google API key', regex: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: 'JWT serializado', regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
];

const failures = [];
const files = trackedFiles();
for (const path of files) {
  for (const rule of forbiddenPaths) {
    if (rule.test(path)) failures.push(`${path}: ${rule.reason} não pode ser versionado`);
  }

  let details;
  try {
    details = statSync(path);
  } catch {
    continue;
  }
  if (!details.isFile() || details.size > 2_000_000) continue;

  let content;
  try {
    content = readFileSync(path, 'utf8');
  } catch {
    continue;
  }
  for (const pattern of secretPatterns) {
    if (pattern.regex.test(content)) failures.push(`${path}: possível ${pattern.name}`);
  }
}

if (failures.length > 0) {
  console.error('Falha na higiene do repositório:');
  for (const failure of [...new Set(failures)].sort()) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Higiene do repositório aprovada (${files.length} arquivos rastreados).`);
