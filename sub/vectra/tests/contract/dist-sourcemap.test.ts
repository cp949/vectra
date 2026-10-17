/*
 * 배포 산출물(dist)의 sourcemap 계약을 검증한다.
 * - `.d.ts`에 `//# sourceMappingURL` 주석이 없다. 가리키는 `.d.ts.map`을 배포하지 않아 참조가 깨진다.
 *   rolldown-plugin-dts는 `dts.sourcemap: false`여도 이 주석을 남긴다. tsdown.config.ts의 plugin이 지운다.
 * - `.js.map`에 `sourcesContent` 키가 없다. `src`는 패키지에 없고 키가 크기의 대부분을 차지한다.
 * - 실제 파일은 빌드된 dist를 대상으로 한다. turbo `test:contract`가 build를 먼저 실행한다.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, test } from 'vitest';

const distRoot = fileURLToPath(new URL('../../dist/', import.meta.url));

/** dist 아래에서 접미사가 일치하는 파일의 상대 경로를 모두 돌려준다. */
function listDistFiles(suffix: string): string[] {
  return (readdirSync(distRoot, { recursive: true }) as string[]).filter((file) => file.endsWith(suffix));
}

beforeAll(() => {
  // dist 디렉터리가 없으면 readdirSync가 ENOENT를 먼저 던진다. 안내 문구가 보이도록 먼저 확인한다.
  if (!existsSync(distRoot) || listDistFiles('.js').length === 0) {
    throw new Error('dist가 없다. pnpm build를 먼저 실행한다 (pnpm --filter @cp949/vectra build)');
  }
});

describe('dist sourcemap 계약', () => {
  test('.d.ts에 sourceMappingURL 주석이 없다', () => {
    const withPragma = listDistFiles('.d.ts').filter((file) =>
      readFileSync(join(distRoot, file), 'utf8').includes('//# sourceMappingURL=')
    );

    expect(withPragma).toEqual([]);
  });

  test('.js.map에 sourcesContent 키가 없다', () => {
    const maps = listDistFiles('.js.map');
    const withSourcesContent = maps.filter(
      (file) => 'sourcesContent' in JSON.parse(readFileSync(join(distRoot, file), 'utf8'))
    );

    // map이 하나도 없으면 아래 단언이 빈 배열로 통과한다. map 유지도 함께 확인한다.
    expect(maps.length).toBeGreaterThan(0);
    expect(withSourcesContent).toEqual([]);
  });
});
