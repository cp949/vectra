#!/usr/bin/env node

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const DEFAULT_OUTPUT = 'docs/internal/examples/coverage.md';
const DEFAULT_EXCEPTIONS = 'docs/internal/examples/coverage-exceptions.json';
const IGNORED_DOMAIN_DIRS = new Set(['internal']);

function compareByLeaf(a, b) {
  return a.leaf.localeCompare(b.leaf);
}

function toPackageLeaf(domain, leafPath) {
  return `@cp949/vectra/${domain}/${leafPath}`;
}

function parseArgs(args) {
  const parsed = {
    repoRoot: process.cwd(),
    output: DEFAULT_OUTPUT,
    exceptions: DEFAULT_EXCEPTIONS,
    write: false,
    strict: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--write') {
      parsed.write = true;
      continue;
    }

    if (arg === '--strict') {
      parsed.strict = true;
      continue;
    }

    if (arg === '--output') {
      parsed.output = args[index + 1];
      index += 1;
      continue;
    }

    if (arg === '--exceptions') {
      parsed.exceptions = args[index + 1];
      index += 1;
      continue;
    }

    if (arg === '--repo-root') {
      parsed.repoRoot = args[index + 1];
      index += 1;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

function printHelp() {
  console.log(`예제 커버리지 report

Usage:
  node scripts/examples/coverage-report.mjs
  node scripts/examples/coverage-report.mjs --write
  node scripts/examples/coverage-report.mjs --strict

Options:
  --write                 docs/internal/examples/coverage.md 파일을 갱신한다.
  --strict                uncovered public leaf가 있으면 exit code 1을 반환한다.
  --output <path>         --write 출력 경로. 기본: ${DEFAULT_OUTPUT}
  --exceptions <path>     예외 파일 경로. 기본: ${DEFAULT_EXCEPTIONS}
  --repo-root <path>      repository root. 기본: 현재 작업 디렉터리
`);
}

async function pathExists(filePath) {
  try {
    await readFile(filePath);
    return true;
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function readDomainExports(repoRoot) {
  const srcRoot = path.join(repoRoot, 'sub/vectra/src');
  const entries = await readdir(srcRoot, { withFileTypes: true });
  const rows = [];
  const byDomainAndName = new Map();

  for (const entry of entries) {
    if (!entry.isDirectory() || IGNORED_DOMAIN_DIRS.has(entry.name)) {
      continue;
    }

    const domain = entry.name;
    const indexPath = path.join(srcRoot, domain, 'index.ts');

    if (!(await pathExists(indexPath))) {
      continue;
    }

    const source = await readFile(indexPath, 'utf8');
    const exportPattern = /^export \{ ([^}]+) \} from '\.\/([^']+)';$/gm;

    for (const match of source.matchAll(exportPattern)) {
      const exportNames = match[1].split(',').map((name) => name.trim());
      const leafPath = match[2];

      for (const exportName of exportNames) {
        const row = {
          domain,
          exportName,
          leafPath,
          leaf: toPackageLeaf(domain, leafPath),
        };
        rows.push(row);
        byDomainAndName.set(`${domain}/${exportName}`, row.leaf);
      }
    }
  }

  rows.sort(compareByLeaf);

  return { rows, byDomainAndName };
}

async function readCoverageExceptions(repoRoot, relativePath = DEFAULT_EXCEPTIONS) {
  const exceptionPath = path.join(repoRoot, relativePath);

  if (!(await pathExists(exceptionPath))) {
    return new Map();
  }

  const parsed = JSON.parse(await readFile(exceptionPath, 'utf8'));
  const exceptions = new Map();

  for (const kind of ['common', 'excluded', 'manual']) {
    const items = Array.isArray(parsed[kind]) ? parsed[kind] : [];

    for (const item of items) {
      const leaf = typeof item === 'string' ? item : item.leaf;
      if (!leaf) {
        continue;
      }

      exceptions.set(leaf, {
        kind,
        reason: typeof item === 'string' ? '' : (item.reason ?? ''),
        exampleIds: typeof item === 'string' ? [] : (item.exampleIds ?? []),
      });
    }
  }

  return exceptions;
}

function getModuleSpecifier(node) {
  return ts.isStringLiteral(node.moduleSpecifier) ? node.moduleSpecifier.text : '';
}

function parseVectraSpecifier(specifier) {
  const prefix = '@cp949/vectra/';
  if (!specifier.startsWith(prefix)) {
    return undefined;
  }

  const parts = specifier.slice(prefix.length).split('/');
  return {
    domain: parts[0],
    leaf: parts.length > 1 ? parts.slice(1).join('/') : undefined,
  };
}

function collectImportedFunctionBindings(source, exportMap) {
  const localFunctions = new Map();
  const namespaceDomains = new Map();
  const namespaceLeafs = new Map();

  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !statement.importClause) {
      continue;
    }

    const parsed = parseVectraSpecifier(getModuleSpecifier(statement));
    if (!parsed) {
      continue;
    }

    const bindings = statement.importClause.namedBindings;
    if (!bindings) {
      continue;
    }

    if (ts.isNamespaceImport(bindings)) {
      if (parsed.leaf) {
        namespaceLeafs.set(bindings.name.text, toPackageLeaf(parsed.domain, parsed.leaf));
      } else {
        namespaceDomains.set(bindings.name.text, parsed.domain);
      }
      continue;
    }

    if (!ts.isNamedImports(bindings)) {
      continue;
    }

    for (const element of bindings.elements) {
      const importedName = element.propertyName?.text ?? element.name.text;
      const localName = element.name.text;
      const leaf = parsed.leaf
        ? toPackageLeaf(parsed.domain, parsed.leaf)
        : exportMap.get(`${parsed.domain}/${importedName}`);

      if (leaf) {
        localFunctions.set(localName, leaf);
      }
    }
  }

  return { localFunctions, namespaceDomains, namespaceLeafs };
}

function collectCalledLeafs(sourceText, exportMap) {
  const source = ts.createSourceFile('source.exam.ts', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const { localFunctions, namespaceDomains, namespaceLeafs } = collectImportedFunctionBindings(source, exportMap);
  const used = new Set();

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const expression = node.expression;

      if (ts.isIdentifier(expression)) {
        const leaf = localFunctions.get(expression.text);
        if (leaf) {
          used.add(leaf);
        }
      }

      if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.expression)) {
        const namespaceName = expression.expression.text;
        const functionName = expression.name.text;
        const domain = namespaceDomains.get(namespaceName);
        const namespaceLeaf = namespaceLeafs.get(namespaceName);

        if (domain) {
          const leaf = exportMap.get(`${domain}/${functionName}`);
          if (leaf) {
            used.add(leaf);
          }
        }

        if (namespaceLeaf) {
          used.add(namespaceLeaf);
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(source);

  return [...used].sort();
}

async function readExampleId(indexPath, fallbackId) {
  const source = await readFile(indexPath, 'utf8');
  const match = source.match(/\bid:\s*['"]([^'"]+)['"]/);
  return match ? match[1] : fallbackId;
}

async function readExamples(repoRoot) {
  const appsRoot = path.join(repoRoot, 'apps');
  const appEntries = await readdir(appsRoot, { withFileTypes: true }).catch((error) => {
    if (error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  });
  const examples = [];

  for (const appEntry of appEntries) {
    if (!appEntry.isDirectory() || !appEntry.name.endsWith('-demo')) {
      continue;
    }

    const prefix = appEntry.name.replace(/-demo$/, '');
    const examplesRoot = path.join(appsRoot, appEntry.name, 'src/examples');
    const exampleEntries = await readdir(examplesRoot, { withFileTypes: true }).catch((error) => {
      if (error && error.code === 'ENOENT') {
        return [];
      }
      throw error;
    });

    for (const exampleEntry of exampleEntries) {
      if (!exampleEntry.isDirectory()) {
        continue;
      }

      const exampleRoot = path.join(examplesRoot, exampleEntry.name);
      const indexPath = path.join(exampleRoot, 'index.ts');
      const sourcePath = path.join(exampleRoot, 'source.exam.ts');

      if (!(await pathExists(indexPath)) || !(await pathExists(sourcePath))) {
        continue;
      }

      const id = await readExampleId(indexPath, exampleEntry.name);
      examples.push({
        app: prefix,
        id,
        fullId: `${prefix}:${id}`,
        sourcePath,
      });
    }
  }

  return examples.sort((a, b) => a.fullId.localeCompare(b.fullId));
}

async function collectExampleUsage(repoRoot, exportMap) {
  const examples = await readExamples(repoRoot);
  const usage = new Map();

  for (const example of examples) {
    const source = await readFile(example.sourcePath, 'utf8');
    const usedLeafs = collectCalledLeafs(source, exportMap);

    for (const leaf of usedLeafs) {
      const current = usage.get(leaf) ?? [];
      current.push(example.fullId);
      usage.set(leaf, current);
    }
  }

  for (const [leaf, ids] of usage) {
    usage.set(leaf, [...new Set(ids)].sort());
  }

  return { examples, usage };
}

function buildCompanionLeafPairs(exportRows) {
  const byDomainAndExportName = new Map();
  const pairs = [];

  for (const row of exportRows) {
    byDomainAndExportName.set(`${row.domain}/${row.exportName}`, row);
  }

  for (const row of exportRows) {
    if (!row.exportName.endsWith('Into')) {
      continue;
    }

    const companionName = row.exportName.slice(0, -'Into'.length);
    const companion = byDomainAndExportName.get(`${row.domain}/${companionName}`);

    if (companion) {
      pairs.push([row.leaf, companion.leaf]);
    }
  }

  return pairs;
}

function applyCompanionEquivalentUsage(usage, exportRows) {
  const expanded = new Map(usage);

  for (const [intoLeaf, allocatingLeaf] of buildCompanionLeafPairs(exportRows)) {
    const equivalentExampleIds = [
      ...new Set([...(expanded.get(intoLeaf) ?? []), ...(expanded.get(allocatingLeaf) ?? [])]),
    ].sort();

    if (equivalentExampleIds.length === 0) {
      continue;
    }

    expanded.set(intoLeaf, equivalentExampleIds);
    expanded.set(allocatingLeaf, equivalentExampleIds);
  }

  return expanded;
}

export async function buildCoverageReport(options = {}) {
  const repoRoot = options.repoRoot ?? process.cwd();
  const exceptionPath = options.exceptions ?? DEFAULT_EXCEPTIONS;
  const publicExports = await readDomainExports(repoRoot);
  const exceptions = await readCoverageExceptions(repoRoot, exceptionPath);
  const { examples, usage } = await collectExampleUsage(repoRoot, publicExports.byDomainAndName);
  const equivalentUsage = applyCompanionEquivalentUsage(usage, publicExports.rows);
  const rows = [];

  for (const item of publicExports.rows) {
    const exception = exceptions.get(item.leaf);

    if (exception?.kind === 'excluded') {
      continue;
    }

    const exampleIds = [
      ...(equivalentUsage.get(item.leaf) ?? []),
      ...(exception?.kind === 'manual' ? exception.exampleIds : []),
    ];
    const uniqueExampleIds = [...new Set(exampleIds)].sort();
    const status = uniqueExampleIds.length > 0 ? 'covered' : exception ? 'excepted' : 'uncovered';

    rows.push({
      leaf: item.leaf,
      exportName: item.exportName,
      exampleIds: uniqueExampleIds,
      exception: exception?.kind ?? '',
      reason: exception?.reason ?? '',
      status,
    });
  }

  rows.sort(compareByLeaf);

  return {
    generatedAt: new Date().toISOString(),
    rows,
    examples,
    summary: {
      total: rows.length,
      covered: rows.filter((row) => row.status === 'covered').length,
      excepted: rows.filter((row) => row.status === 'excepted').length,
      uncovered: rows.filter((row) => row.status === 'uncovered').length,
      examples: examples.length,
    },
  };
}

function escapeMarkdownCell(value) {
  return String(value).replaceAll('|', '\\|');
}

function formatCodeList(values) {
  return values.map((value) => `\`${value}\``).join(', ');
}

export function renderMarkdownReport(report) {
  const lines = [
    '# 예제 커버리지',
    '',
    '이 파일은 스크립트로 생성한다. 커버리지 누락은 에러가 아니다.',
    '',
    '생성 명령:',
    '',
    '```sh',
    'pnpm examples:coverage:write',
    '```',
    '',
    '## 요약',
    '',
    `- 전체 public leaf: ${report.summary.total}`,
    `- covered: ${report.summary.covered}`,
    `- excepted: ${report.summary.excepted}`,
    `- uncovered: ${report.summary.uncovered}`,
    `- 예제 수: ${report.summary.examples}`,
    '',
    '## 표',
    '',
    '| Public leaf | Export name | 사용 예제 ID | 예외 | 상태 |',
    '| --- | --- | --- | --- | --- |',
  ];

  for (const row of report.rows) {
    lines.push(
      `| ${[
        `\`${escapeMarkdownCell(row.leaf)}\``,
        `\`${escapeMarkdownCell(row.exportName)}\``,
        formatCodeList(row.exampleIds),
        escapeMarkdownCell(row.exception),
        escapeMarkdownCell(row.status),
      ].join(' | ')} |`
    );
  }

  lines.push('');

  return `${lines.join('\n')}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const report = await buildCoverageReport({ repoRoot: args.repoRoot, exceptions: args.exceptions });
  const markdown = renderMarkdownReport(report);

  if (args.write) {
    const outputPath = path.join(args.repoRoot, args.output);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, markdown, 'utf8');
    console.log(`wrote ${args.output}`);
  } else {
    process.stdout.write(markdown);
  }

  if (args.strict && report.summary.uncovered > 0) {
    process.exitCode = 1;
  }
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isCli) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
