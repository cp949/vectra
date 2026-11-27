/**
 * 변경된 vectra 파일에 대해 타입 검사, 단위 테스트, lint, 서식 검사를 실행한다.
 * 실행 위치를 기준으로 파일 경로를 받는다.
 */
import { spawnSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const files = [...new Set(process.argv.slice(2).map((file) => relative(packageRoot, resolve(file))))];

if (!files.length) {
  console.error('사용법: node sub/vectra/scripts/verify-batch.mjs <변경 파일> ...');
  process.exit(1);
}

for (const file of files) {
  if (
    isAbsolute(file) ||
    file.startsWith('..' + sep) ||
    !statSync(resolve(packageRoot, file), { throwIfNoEntry: false })?.isFile()
  ) {
    console.error(`vectra 패키지 안에 있는 파일을 지정한다. 입력: ${file}`);
    process.exit(1);
  }
}

const sources = files.filter((file) => file.startsWith('src' + sep));
const unitTests = files.filter((file) => file.startsWith(['tests', 'unit', ''].join(sep)));
const commands = [['typecheck']];

if (sources.length) {
  commands.push([
    'exec',
    'vitest',
    'related',
    '--run',
    '--config',
    'vitest.config.ts',
    '--exclude',
    '**/tests/contract/**',
    '--passWithNoTests',
    ...sources,
  ]);
}
if (unitTests.length) {
  commands.push(['exec', 'vitest', 'run', '--config', 'vitest.config.ts', ...unitTests]);
}

commands.push(
  ['exec', 'oxlint', '-c', '../../.oxlintrc.json', '--deny-warnings', '--', ...files],
  ['exec', 'oxfmt', '--check', '--', ...files]
);

for (const args of commands) {
  const result = spawnSync('pnpm', args, { cwd: packageRoot, stdio: 'inherit' });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
