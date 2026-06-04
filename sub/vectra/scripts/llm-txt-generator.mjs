function extractHeadingSummary(readmeText) {
  const lines = readmeText.split(/\r?\n/);
  const summary = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('```')) {
      continue;
    }

    summary.push(trimmed);

    if (summary.length >= 3) {
      break;
    }
  }

  return summary;
}

function normalizeExportName(name) {
  return name
    .trim()
    .replace(/\s+as\s+.+$/, '')
    .trim();
}

function extractExportNames(sourceText) {
  const names = [];

  for (const match of sourceText.matchAll(/export\s+\{([^}]+)\}/g)) {
    for (const part of match[1].split(',')) {
      const name = normalizeExportName(part);
      if (name && !names.includes(name)) {
        names.push(name);
      }
    }
  }

  for (const match of sourceText.matchAll(/export\s+(?:declare\s+)?(?:function|type|interface|class|const|enum)\s+([A-Za-z_$][\w$]*)/g)) {
    const name = match[1];
    if (!names.includes(name)) {
      names.push(name);
    }
  }

  return names.sort((a, b) => a.localeCompare(b));
}

function formatModuleLine(module) {
  const exportNames = extractExportNames(module.sourceText);

  return `- \`${module.moduleSpecifier}\` -> \`${module.modulePath}\` (${exportNames.length} exported declarations)`;
}

function renderExportMap(modules) {
  return modules.map(formatModuleLine);
}

function renderDeclarationInventory(declarationFiles) {
  const domainIndexes = declarationFiles.filter((file) => /dist\/[^/]+\/index\.d\.ts$/.test(file));

  return [
    `- Declaration files: ${declarationFiles.length}`,
    `- Public domain index declarations: ${domainIndexes.length}`,
    `- Root declarations: \`dist/index.d.ts\``,
    '- TypeScript users should rely on package exports and generated `.d.ts` files, not implementation chunks.',
  ];
}

export function renderLlmTxt({ packageJson, readmeText, modules, declarationFiles }) {
  const overview = [...new Set(extractHeadingSummary(readmeText))];
  const publicModules = renderExportMap(modules);
  const declarationInventory = renderDeclarationInventory(declarationFiles);

  const sections = [
    `# Library: ${packageJson.name}`,
    '',
    '## Overview',
    ...overview.map((line) => `- ${line}`),
    '- TypeScript 2D geometry and math function catalog.',
    '- Package is ESM-only and ships generated JavaScript plus declaration files under `dist/`.',
    '',
    '## Install',
    `- \`npm install ${packageJson.name}\``,
    '',
    '## Public Modules',
    ...publicModules,
    '',
    '## Declaration Inventory',
    ...declarationInventory,
    '',
    '## Usage Patterns',
    `- Import broad APIs from \`${packageJson.name}\` when bundle size is not critical.`,
    `- Import domain APIs from subpaths such as \`${packageJson.name}/vec\`, \`${packageJson.name}/segment\`, or \`${packageJson.name}/intersects\`.`,
    '- Prefer `*Into` functions when reusing output objects matters.',
    '- Treat degenerate geometry behavior as part of the public contract documented by the package tests and README.',
    '',
    '## Constraints',
    '- Only use package root or exported subpaths listed in `package.json#exports`.',
    '- Do not import from `dist/chunk-*`, private implementation files, or unexported leaf modules.',
    '- Do not assume mutation unless the API name ends with `Into` or the declaration explicitly documents an output parameter.',
    '- This package does not require browser Canvas APIs.',
  ];

  return `${sections.join('\n')}\n`;
}
