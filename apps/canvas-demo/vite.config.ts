import { readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import type { Plugin as EsbuildPlugin } from 'esbuild';
import type { Plugin, ViteDevServer } from 'vite';
import { defineConfig } from 'vite';
import { VECTRA_SANDBOX_BARREL_SPECIFIERS } from './src/sandbox/vectra-sandbox-specifiers';

// ESM 환경에서 __dirname 대신 import.meta.url 기반으로 현재 디렉터리를 구한다
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const playgroundSourceEntry = fileURLToPath(new URL('../../sub/playground/src/index.ts', import.meta.url));
const vectraSourceDir = fileURLToPath(new URL('../../sub/vectra/src/', import.meta.url));
const vectraPackageName = '@cp949/vectra';

/** 디렉터리 아래 TypeScript 소스 파일을 재귀적으로 수집한다 */
function listTypeScriptFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = `${dir}${entry}`;
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...listTypeScriptFiles(`${path}/`));
    } else if (path.endsWith('.ts')) {
      files.push(path);
    }
  }
  return files;
}

/** vectra package specifier를 source 파일 경로로 변환한다 */
function resolveVectraSourceSpecifier(specifier: string): string | undefined {
  if (specifier === vectraPackageName) return `${vectraSourceDir}index.ts`;
  if (specifier === `${vectraPackageName}/types`) return `${vectraSourceDir}types/index.ts`;
  if (!specifier.startsWith(`${vectraPackageName}/`)) return undefined;

  const parts = specifier.slice(vectraPackageName.length + 1).split('/');
  if (parts.length === 1) {
    return `${vectraSourceDir}${parts[0]}/index.ts`;
  }
  if (parts.length === 2) {
    return `${vectraSourceDir}${parts[0]}/${parts[1]}.ts`;
  }
  return undefined;
}

/** esbuild stdin bundle 안의 vectra import를 dist 대신 source로 연결한다 */
function vectraSourceEsbuildPlugin(): EsbuildPlugin {
  return {
    name: 'vectra-source-resolve',
    setup(build) {
      build.onResolve({ filter: /^@cp949\/vectra(?:\/.*)?$/ }, (args) => {
        const path = resolveVectraSourceSpecifier(args.path);
        if (!path) return undefined;
        return { path };
      });
    },
  };
}

/** vectra 모든 서브패스를 self-contained IIFE로 번들링하는 Vite 플러그인 */
function vectraSandboxPlugin(): Plugin {
  const virtualId = 'virtual:vectra-sandbox-js';
  const resolvedId = '\0virtual:vectra-sandbox-js';
  let cachedBundle: string | null = null;
  let server: ViteDevServer | null = null;

  return {
    name: 'vectra-sandbox',
    configureServer(devServer) {
      server = devServer;
    },
    resolveId(id) {
      if (id === virtualId) return resolvedId;
      return undefined;
    },
    async load(id) {
      if (id !== resolvedId) return;
      if (cachedBundle !== null) {
        return `export const VECTRA_SANDBOX_JS = ${JSON.stringify(cachedBundle)};`;
      }
      for (const file of listTypeScriptFiles(vectraSourceDir)) {
        this.addWatchFile(file);
      }

      // esbuild로 vectra 전체를 IIFE로 번들링한다.
      // IIFE 실행 시 window.__modules__에 모든 vectra barrel 모듈이 설정된다.
      const { build } = await import('esbuild');

      const entryContent = [
        ...VECTRA_SANDBOX_BARREL_SPECIFIERS.map((specifier, index) => `import * as m${index} from '${specifier}';`),
        'window.__modules__={',
        ...VECTRA_SANDBOX_BARREL_SPECIFIERS.map((specifier, index) => `  ${JSON.stringify(specifier)}:m${index},`),
        '};',
      ].join('\n');

      // esbuild 번들링: 실패 시 Vite-aware 에러를 던진다
      const result = await build({
        stdin: {
          contents: entryContent,
          loader: 'ts',
          // resolveDir을 apps/canvas-demo로 설정해야 pnpm 심볼릭 링크(node_modules/vectra)를 찾을 수 있다
          resolveDir: __dirname,
        },
        bundle: true,
        format: 'iife',
        platform: 'browser',
        write: false,
        logLevel: 'silent',
        plugins: [vectraSourceEsbuildPlugin()],
      }).catch((err: unknown) => {
        // esbuild 번들 실패를 Vite-aware 에러로 변환한다
        this.error(`vectra sandbox 번들 빌드 실패: ${err instanceof Error ? err.message : String(err)}`);
      });

      // 빈 출력은 번들 실패로 간주하여 캐시하지 않는다
      const bundleText = result?.outputFiles[0]?.text;
      if (!bundleText) {
        this.error('vectra sandbox 번들 출력이 비어 있습니다');
      }

      cachedBundle = bundleText;
      return `export const VECTRA_SANDBOX_JS = ${JSON.stringify(cachedBundle)};`;
    },
    // 개발 모드에서 vectra 소스 변경 시 캐시 무효화
    handleHotUpdate(ctx) {
      if (!ctx.file.startsWith(vectraSourceDir)) return;
      cachedBundle = null;
      const mod = server?.moduleGraph.getModuleById(resolvedId);
      if (mod) {
        server?.moduleGraph.invalidateModule(mod);
      }
      server?.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}

// canvas-demo Vite 빌드 설정
export default defineConfig({
  plugins: [react(), vectraSandboxPlugin()],
  build: {
    chunkSizeWarningLimit: 8000,
  },
  resolve: {
    alias: [
      // workspace package dist가 stale해도 demo는 최신 playground source를 직접 사용한다
      { find: '@repo/playground', replacement: playgroundSourceEntry },
      // demo 개발 중 vectra import도 dist 빌드 없이 source를 직접 사용한다
      { find: '@cp949/vectra/types', replacement: `${vectraSourceDir}types/index.ts` },
      { find: /^@cp949\/vectra\/([^/]+)$/, replacement: `${vectraSourceDir}$1/index.ts` },
      { find: /^@cp949\/vectra\/([^/]+)\/(.+)$/, replacement: `${vectraSourceDir}$1/$2.ts` },
      { find: '@cp949/vectra', replacement: `${vectraSourceDir}index.ts` },
    ],
  },
});
