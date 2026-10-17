/*
 * package.json `exports` 조건 계약을 검증한다.
 * - 각 항목의 첫 조건은 `types`다. TypeScript는 조건을 순서대로 해석한다.
 * - 각 항목에 `default`가 있다. 없으면 CJS `require()`가 ERR_PACKAGE_PATH_NOT_EXPORTED로 실패한다.
 * - 실제 `require()`는 빌드된 dist를 대상으로 한다. turbo `test:contract`가 build를 먼저 실행한다.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, test } from 'vitest';
import packageJson from '../../package.json' with { type: 'json' };

const packageRoot = fileURLToPath(new URL('../../', import.meta.url));
const entries = Object.entries(packageJson.exports);

beforeAll(() => {
  if (!existsSync(new URL('../../dist/index.js', import.meta.url))) {
    throw new Error('dist가 없다. pnpm build를 먼저 실행한다 (pnpm --filter @cp949/vectra build)');
  }
});

/**
 * 모든 exports specifier를 CJS `require()`로 불러 실패한 항목을 돌려준다.
 * 패키지 자기 참조(self-reference)를 쓰므로 cwd가 패키지 루트여야 한다.
 */
function requireAllSpecifiers(specifiers: string[]): Array<{ specifier: string; code: string }> {
  const script = `
    const failures = [];
    for (const specifier of ${JSON.stringify(specifiers)}) {
      try {
        require(specifier);
      } catch (error) {
        failures.push({ specifier, code: error.code ?? String(error) });
      }
    }
    console.log(JSON.stringify(failures));
  `;
  const stdout = execFileSync(process.execPath, ['--input-type=commonjs', '-e', script], {
    cwd: packageRoot,
    encoding: 'utf8',
  });
  return JSON.parse(stdout);
}

describe('package exports 조건', () => {
  test('각 항목의 첫 조건은 types다', () => {
    const wrongOrder = entries
      .filter(([, conditions]) => Object.keys(conditions)[0] !== 'types')
      .map(([subpath]) => subpath);

    expect(wrongOrder).toEqual([]);
  });

  test('각 항목에 default 조건이 있고 import와 같은 파일을 가리킨다', () => {
    const mismatched = entries
      .filter(([, conditions]) => !('default' in conditions) || conditions.default !== conditions.import)
      .map(([subpath]) => subpath);

    expect(mismatched).toEqual([]);
  });

  test('CJS require()로 모든 subpath를 불러온다', () => {
    const specifiers = entries.map(([subpath]) =>
      subpath === '.' ? packageJson.name : `${packageJson.name}/${subpath.slice(2)}`
    );

    expect(requireAllSpecifiers(specifiers)).toEqual([]);
  });
});
