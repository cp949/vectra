import { isAbsolute, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsdown';
import { buildEntrypoints } from './build-entrypoints.ts';

const sourceRoot = fileURLToPath(new URL('./src/', import.meta.url));

// chunk의 moduleIds에서 가장 많은 domain 이름을 구한다. `internal`은 제외한다.
// domain은 패키지 src 기준 첫 디렉터리다. 절대 경로의 `/src/`를 찾으면 checkout 경로(예: ~/src/)에 걸린다.
function majorityDomain(moduleIds: readonly string[]): string | undefined {
  const counts = new Map<string, number>();
  for (const id of moduleIds) {
    const path = relative(sourceRoot, id);
    const segments = path.split(sep);
    // src 밖 모듈, 가상 모듈, src 바로 아래 파일은 domain이 없다.
    if (isAbsolute(path) || segments[0] === '..' || segments.length < 2) continue;
    const domain = segments[0];
    if (domain !== 'internal') counts.set(domain, (counts.get(domain) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0];
}

// rolldown-plugin-dts는 dts.sourcemap: false일 때 .d.ts.map만 지우고
// chunk 끝의 sourceMappingURL pragma는 남긴다. 가리키는 파일이 없어 pragma를 지운다.
const stripDtsSourcemapPragma = {
  name: 'strip-dts-sourcemap-pragma',
  generateBundle(_options: unknown, bundle: Record<string, { type: string; fileName: string; code?: string }>) {
    for (const chunk of Object.values(bundle)) {
      if (chunk.type === 'chunk' && chunk.fileName.endsWith('.d.ts') && chunk.code !== undefined) {
        chunk.code = chunk.code.replace(/\n\/\/# sourceMappingURL=\S+\s*$/, '\n');
      }
    }
  },
};

export default defineConfig({
  entry: buildEntrypoints(),
  format: ['esm'],
  target: 'es2020',
  platform: 'neutral',
  fixedExtension: false,
  dts: {
    sourcemap: false,
  },
  sourcemap: true,
  plugins: [stripDtsSourcemapPragma],
  outputOptions: {
    // .js.map은 유지하고 sourcesContent만 뺀다. src는 패키지에 없어 내용이 필요 없다.
    sourcemapExcludeSources: true,
    // chunk 파일명에 domain을 넣는다. chunk 분할은 바꾸지 않고 이름만 바꾼다.
    // `[name]`은 dts 플러그인이 .d.ts 이름을 만들 때 쓰고, `[hash]`는 이름 충돌을 막는다.
    chunkFileNames: (chunk) => {
      const domain = majorityDomain(chunk.moduleIds);
      return domain && !chunk.name.startsWith(domain) ? `${domain}-[name]-[hash].js` : '[name]-[hash].js';
    },
  },
  clean: true,
  outDir: 'dist',
  // keepNames를 켜지 않는다. 도메인 barrel을 한 파일로 병합하므로,
  // 켜면 최상위 `__name(...)` 호출이 남아 tree-shaking을 막는다.
});
