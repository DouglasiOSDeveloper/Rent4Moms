import { copyFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const dist = resolve('dist');
const indexPath = resolve(dist, 'index.html');
const fallbackPath = resolve(dist, '404.html');
const noJekyllPath = resolve(dist, '.nojekyll');

await stat(indexPath);
await copyFile(indexPath, fallbackPath);
await writeFile(noJekyllPath, '', 'utf8');

console.log('GitHub Pages preparado: 404.html para rotas SPA e .nojekyll criados.');
