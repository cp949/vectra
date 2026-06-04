import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderLlmTxt } from './llm-txt-generator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');

async function readText(relativePath) {
  return readFile(path.join(packageRoot, relativePath), 'utf8');
}

async function listDeclarationFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listDeclarationFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.d.ts')) {
      files.push(path.relative(packageRoot, fullPath));
    }
  }

  return files.sort();
}

async function readPublicModules(packageJson) {
  const modules = [];

  for (const [specifierPath, exportTarget] of Object.entries(packageJson.exports ?? {})) {
    if (specifierPath.includes('*') || typeof exportTarget !== 'object' || exportTarget === null) {
      continue;
    }

    const typesPath = exportTarget.types;
    if (typeof typesPath !== 'string') {
      continue;
    }

    const moduleSpecifier = specifierPath === '.' ? packageJson.name : `${packageJson.name}${specifierPath.slice(1)}`;
    const modulePath = typesPath.replace(/^\.\//, '');
    const sourceText = await readText(modulePath);

    modules.push({
      modulePath,
      moduleSpecifier,
      sourceText,
    });
  }

  return modules;
}

async function main() {
  const packageJson = JSON.parse(await readText('package.json'));
  const readmeText = await readText('README.md');
  const declarationFiles = await listDeclarationFiles(path.join(packageRoot, 'dist'));
  const modules = await readPublicModules(packageJson);

  const output = renderLlmTxt({
    packageJson,
    readmeText,
    modules,
    declarationFiles,
  });

  await writeFile(path.join(packageRoot, 'llm.txt'), output, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
