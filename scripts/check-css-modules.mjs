import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import process from 'node:process';

const root = resolve(process.cwd(), 'src');
const sourceExtensions = new Set(['.ts', '.tsx']);
const moduleCache = new Map();
const problems = [];

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function declaredClasses(cssPath) {
  if (moduleCache.has(cssPath)) return moduleCache.get(cssPath);
  const css = readFileSync(cssPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const classes = new Set();
  for (const match of css.matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)/g)) {
    classes.add(match[1]);
  }
  moduleCache.set(cssPath, classes);
  return classes;
}

function resolveImport(importer, specifier) {
  if (specifier.startsWith('@/')) {
    return resolve(root, specifier.slice(2));
  }
  return resolve(dirname(importer), specifier);
}

for (const file of walk(root)) {
  if (!sourceExtensions.has(file.slice(file.lastIndexOf('.')))) continue;

  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(/import\s+(\w+)\s+from\s+['"]([^'"]+\.module\.css)['"]/g)) {
    const [, binding, specifier] = match;
    const cssPath = resolveImport(file, specifier);

    let classes;
    try {
      classes = declaredClasses(cssPath);
    } catch {
      problems.push(`${relative(root, file)}: arquivo CSS não encontrado (${specifier})`);
      continue;
    }

    const usage = new RegExp(`\\b${binding}\\.([A-Za-z_][A-Za-z0-9_]*)`, 'g');
    for (const usageMatch of source.matchAll(usage)) {
      const className = usageMatch[1];
      if (!classes.has(className)) {
        problems.push(
          `${relative(root, file)}: classe "${className}" ausente em ${relative(root, cssPath)}`,
        );
      }
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}

console.log('CSS Modules: nenhuma classe ausente encontrada.');
