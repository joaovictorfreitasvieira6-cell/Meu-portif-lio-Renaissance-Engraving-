import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const failures = [];

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  });
}

function checkReference(value, owner) {
  if (!value || /^(https?:|data:|#|mailto:)/.test(value)) return;
  const localPath = decodeURIComponent(value.split(/[?#]/)[0]);
  if (localPath.startsWith('#')) return;
  const target = path.resolve(path.dirname(owner), localPath);
  if (!fs.existsSync(target)) failures.push(`${path.relative(root, owner)}: ${value}`);
}

const sources = [path.join(root, 'index.html'), ...filesIn(path.join(root, 'src'))];
for (const file of sources) {
  const source = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.js')) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (result.status !== 0) failures.push(result.stderr);
    for (const match of source.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)) {
      checkReference(match[1], file);
    }
  }
  if (file.endsWith('.html')) {
    for (const match of source.matchAll(/(?:src|href)="([^"]+)"/g)) {
      checkReference(match[1], file);
    }
  }
  if (file.endsWith('.css')) {
    for (const match of source.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) {
      checkReference(match[1], file);
    }
    for (const match of source.matchAll(/@import\s+['"]([^'"]+)['"]/g)) {
      checkReference(match[1], file);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Checked ${sources.length} source files: syntax and local references OK.`);
}
