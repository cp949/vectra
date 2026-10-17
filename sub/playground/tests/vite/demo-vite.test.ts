/**
 * 데모 앱 공유 Vite 조각 단위 테스트
 *
 * specifier → source 경로 변환, alias, sandbox 번들 plugin을 검증한다.
 */
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  demoResolveAliases,
  PLAYGROUND_SOURCE_ENTRY,
  pixiSandboxPlugin,
  resolveVectraSourceSpecifier,
  VECTRA_SOURCE_DIR,
  vectraSandboxPlugin,
} from '../../vite/index';

const appDir = fileURLToPath(new URL('../..', import.meta.url));

/** plugin.load를 직접 호출하기 위한 최소 rollup context */
function createLoadContext() {
  const watched: string[] = [];
  return {
    watched,
    addWatchFile: (file: string) => watched.push(file),
    error: (message: string): never => {
      throw new Error(message);
    },
  };
}

type LoadFn = (this: unknown, id: string) => Promise<string | undefined>;

describe('resolveVectraSourceSpecifier', () => {
  it('root를 index.ts로 변환한다', () => {
    expect(resolveVectraSourceSpecifier('@cp949/vectra')).toBe(`${VECTRA_SOURCE_DIR}index.ts`);
  });

  it('domain barrel을 <domain>/index.ts로 변환한다', () => {
    expect(resolveVectraSourceSpecifier('@cp949/vectra/vec')).toBe(`${VECTRA_SOURCE_DIR}vec/index.ts`);
    expect(resolveVectraSourceSpecifier('@cp949/vectra/types')).toBe(`${VECTRA_SOURCE_DIR}types/index.ts`);
  });

  it('package exports가 열지 않는 leaf specifier는 변환하지 않는다', () => {
    expect(resolveVectraSourceSpecifier('@cp949/vectra/vec/add-into')).toBeUndefined();
  });

  it('vectra가 아닌 specifier는 변환하지 않는다', () => {
    expect(resolveVectraSourceSpecifier('pixi.js')).toBeUndefined();
    expect(resolveVectraSourceSpecifier('@cp949/vectra-extra')).toBeUndefined();
  });
});

describe('demoResolveAliases', () => {
  const aliases = demoResolveAliases();

  /** vite alias 규칙대로 첫 번째 일치 항목으로 치환한다 */
  function resolveAlias(specifier: string): string | undefined {
    for (const { find, replacement } of aliases) {
      if (typeof find === 'string') {
        if (specifier === find) return replacement;
      } else if (find.test(specifier)) {
        return specifier.replace(find, replacement);
      }
    }
    return undefined;
  }

  it('@repo/playground를 playground source 진입점으로 연결한다', () => {
    expect(resolveAlias('@repo/playground')).toBe(PLAYGROUND_SOURCE_ENTRY);
  });

  it('root와 domain barrel을 vectra source로 연결한다', () => {
    expect(resolveAlias('@cp949/vectra')).toBe(`${VECTRA_SOURCE_DIR}index.ts`);
    expect(resolveAlias('@cp949/vectra/vec')).toBe(`${VECTRA_SOURCE_DIR}vec/index.ts`);
  });

  it('leaf specifier는 연결하지 않는다', () => {
    expect(resolveAlias('@cp949/vectra/vec/add-into')).toBeUndefined();
  });
});

describe('vectraSandboxPlugin', () => {
  it('virtual module id만 해석한다', () => {
    const plugin = vectraSandboxPlugin({ appDir, specifiers: [] });
    const resolveId = plugin.resolveId as (id: string) => string | undefined;

    expect(resolveId('virtual:vectra-sandbox-js')).toBe('\0virtual:vectra-sandbox-js');
    expect(resolveId('other')).toBeUndefined();
  });

  it('지정한 specifier를 window.__modules__에 등록하는 IIFE를 만든다', async () => {
    const plugin = vectraSandboxPlugin({ appDir, specifiers: ['@cp949/vectra/vec'] });
    const ctx = createLoadContext();
    const code = await (plugin.load as LoadFn).call(ctx, '\0virtual:vectra-sandbox-js');

    expect(code).toMatch(/^export const VECTRA_SANDBOX_JS = ".*";$/s);
    // export 값을 되돌려 실제 번들을 실행한다
    const bundle = JSON.parse(code?.slice('export const VECTRA_SANDBOX_JS = '.length, -1) ?? '""') as string;
    const win: { __modules__?: Record<string, { addInto?: unknown }> } = {};
    new Function('window', bundle)(win);

    expect(Object.keys(win.__modules__ ?? {})).toEqual(['@cp949/vectra/vec']);
    expect(typeof win.__modules__?.['@cp949/vectra/vec']?.addInto).toBe('function');
    expect(ctx.watched.length).toBeGreaterThan(0);
  });

  it('해석할 수 없는 specifier는 번들 실패 오류로 알린다', async () => {
    const plugin = vectraSandboxPlugin({ appDir, specifiers: ['@cp949/vectra/vec/add-into'] });

    await expect((plugin.load as LoadFn).call(createLoadContext(), '\0virtual:vectra-sandbox-js')).rejects.toThrow(
      'vectra sandbox 번들 빌드 실패'
    );
  });

  it('다른 id는 무시한다', async () => {
    const plugin = vectraSandboxPlugin({ appDir, specifiers: [] });

    expect(await (plugin.load as LoadFn).call(createLoadContext(), 'other')).toBeUndefined();
  });
});

describe('pixiSandboxPlugin', () => {
  it('virtual module id만 해석한다', () => {
    const plugin = pixiSandboxPlugin({ appDir });
    const resolveId = plugin.resolveId as (id: string) => string | undefined;

    expect(resolveId('virtual:pixi-sandbox-js')).toBe('\0virtual:pixi-sandbox-js');
    expect(resolveId('other')).toBeUndefined();
  });
});
