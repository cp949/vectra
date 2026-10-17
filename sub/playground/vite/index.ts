/**
 * 데모 앱(canvas-demo, pixi-demo, showcase)이 공유하는 Vite 설정 조각.
 *
 * Node에서만 실행한다. 브라우저 번들(`src/`)에는 넣지 않는다.
 * 각 앱의 vite.config.ts가 상대 경로로 import한다.
 */
import { readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Plugin as EsbuildPlugin } from 'esbuild';
import type { Alias, Plugin, ViteDevServer } from 'vite';

const VECTRA_PACKAGE_NAME = '@cp949/vectra';

/** 데모가 workspace package dist 대신 직접 쓰는 playground source 진입점 */
export const PLAYGROUND_SOURCE_ENTRY = fileURLToPath(new URL('../src/index.ts', import.meta.url));

/** vectra source 디렉터리. 끝에 `/`가 있다 */
export const VECTRA_SOURCE_DIR = fileURLToPath(new URL('../../vectra/src/', import.meta.url));

/**
 * 데모 build의 chunk 크기 경고 기준(kB).
 *
 * monaco-env chunk가 약 7.3 MB라 vite 기본값 500은 항상 경고한다.
 * 이 값은 monaco 크기에 맞춘 것이다. 다른 chunk의 크기 증가는 가리지 못한다.
 */
export const DEMO_CHUNK_SIZE_WARNING_LIMIT = 8000;

/** 디렉터리 아래 TypeScript 소스 파일을 재귀적으로 수집한다 */
function listTypeScriptFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = `${dir}${entry}`;
    if (statSync(path).isDirectory()) {
      files.push(...listTypeScriptFiles(`${path}/`));
    } else if (path.endsWith('.ts')) {
      files.push(path);
    }
  }
  return files;
}

/**
 * vectra package specifier를 source 파일 경로로 변환한다.
 *
 * root와 domain barrel만 변환한다. package exports가 열지 않는 leaf specifier는 undefined다.
 */
export function resolveVectraSourceSpecifier(specifier: string): string | undefined {
  if (specifier === VECTRA_PACKAGE_NAME) return `${VECTRA_SOURCE_DIR}index.ts`;
  if (!specifier.startsWith(`${VECTRA_PACKAGE_NAME}/`)) return undefined;

  const parts = specifier.slice(VECTRA_PACKAGE_NAME.length + 1).split('/');
  if (parts.length !== 1) return undefined;
  // `types`는 domain 이름이지만 barrel 경로가 같은 `types/index.ts`다
  return `${VECTRA_SOURCE_DIR}${parts[0]}/index.ts`;
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

/** `resolve.alias`에 넣는 목록. 앱 코드의 playground, vectra import를 source로 연결한다 */
export function demoResolveAliases(): Alias[] {
  return [
    { find: '@repo/playground', replacement: PLAYGROUND_SOURCE_ENTRY },
    { find: /^@cp949\/vectra\/([^/]+)$/, replacement: `${VECTRA_SOURCE_DIR}$1/index.ts` },
    { find: /^@cp949\/vectra$/, replacement: `${VECTRA_SOURCE_DIR}index.ts` },
  ];
}

export interface VectraSandboxPluginOptions {
  /** esbuild resolveDir. pnpm 심볼릭 링크를 찾으려면 앱 디렉터리여야 한다 */
  readonly appDir: string;
  /** `window.__modules__`에 등록할 vectra specifier 목록 */
  readonly specifiers: readonly string[];
}

/**
 * vectra specifier 목록을 self-contained IIFE로 번들링하는 Vite 플러그인.
 *
 * `virtual:vectra-sandbox-js`가 `VECTRA_SANDBOX_JS` 문자열을 export한다.
 * 이 코드를 실행하면 `window.__modules__`에 각 specifier의 namespace가 설정된다.
 */
export function vectraSandboxPlugin(options: VectraSandboxPluginOptions): Plugin {
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
      for (const file of listTypeScriptFiles(VECTRA_SOURCE_DIR)) {
        this.addWatchFile(file);
      }

      const { build } = await import('esbuild');
      const imports = options.specifiers.map((specifier, index) => {
        return `import * as m${index} from ${JSON.stringify(specifier)};`;
      });
      const moduleEntries = options.specifiers.map((specifier, index) => {
        return `  ${JSON.stringify(specifier)}:m${index},`;
      });
      const entryContent = [...imports, 'window.__modules__={', ...moduleEntries, '};'].join('\n');

      const result = await build({
        stdin: { contents: entryContent, loader: 'ts', resolveDir: options.appDir },
        bundle: true,
        format: 'iife',
        platform: 'browser',
        write: false,
        logLevel: 'silent',
        plugins: [vectraSourceEsbuildPlugin()],
      }).catch((err: unknown) => {
        this.error(`vectra sandbox 번들 빌드 실패: ${err instanceof Error ? err.message : String(err)}`);
      });

      // 빈 출력은 번들 실패다. 캐시하지 않는다
      const bundleText = result?.outputFiles[0]?.text;
      if (!bundleText) {
        this.error('vectra sandbox 번들 출력이 비어 있습니다');
      }

      cachedBundle = bundleText;
      return `export const VECTRA_SANDBOX_JS = ${JSON.stringify(cachedBundle)};`;
    },
    // dev 서버에서 vectra 소스가 바뀌면 캐시를 버리고 전체 reload한다
    handleHotUpdate(ctx) {
      if (!ctx.file.startsWith(VECTRA_SOURCE_DIR)) return;
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

export interface PixiSandboxPluginOptions {
  /** esbuild resolveDir. 앱의 `pixi.js`를 찾으려면 앱 디렉터리여야 한다 */
  readonly appDir: string;
}

/**
 * `pixi.js`를 IIFE로 번들링하는 Vite 플러그인.
 *
 * `virtual:pixi-sandbox-js`가 `PIXI_SANDBOX_JS` 문자열을 export한다.
 * 이 코드를 실행하면 `window.__PIXI__`가 설정된다.
 */
export function pixiSandboxPlugin(options: PixiSandboxPluginOptions): Plugin {
  const virtualId = 'virtual:pixi-sandbox-js';
  const resolvedId = '\0virtual:pixi-sandbox-js';
  let cachedBundle: string | null = null;

  return {
    name: 'pixi-sandbox',
    resolveId(id) {
      if (id === virtualId) return resolvedId;
      return undefined;
    },
    async load(id) {
      if (id !== resolvedId) return;
      if (cachedBundle !== null) {
        return `export const PIXI_SANDBOX_JS = ${JSON.stringify(cachedBundle)};`;
      }

      const { build } = await import('esbuild');
      const result = await build({
        stdin: {
          contents: "import * as PIXI from 'pixi.js'; window.__PIXI__ = PIXI;",
          loader: 'ts',
          resolveDir: options.appDir,
        },
        bundle: true,
        format: 'iife',
        platform: 'browser',
        write: false,
        logLevel: 'silent',
      }).catch((err: unknown) => {
        this.error(`pixi sandbox 번들 빌드 실패: ${err instanceof Error ? err.message : String(err)}`);
      });

      const bundleText = result?.outputFiles[0]?.text;
      if (!bundleText) {
        this.error('pixi sandbox 번들 출력이 비어 있습니다');
      }

      cachedBundle = bundleText;
      return `export const PIXI_SANDBOX_JS = ${JSON.stringify(cachedBundle)};`;
    },
  };
}
