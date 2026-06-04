import { readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import type { Plugin as EsbuildPlugin } from 'esbuild';
import type { Plugin, ViteDevServer } from 'vite';
import { defineConfig } from 'vite';
import { SHOWCASE_RUNTIME_MODULE_SPECIFIERS } from './src/sandbox/pixi-module-specifiers';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const playgroundSourceEntry = fileURLToPath(new URL('../../sub/playground/src/index.ts', import.meta.url));
const vectraSourceDir = fileURLToPath(new URL('../../sub/vectra/src/', import.meta.url));
const vectraPackageName = '@cp949/vectra';

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

      const { build } = await import('esbuild');
      const imports = SHOWCASE_RUNTIME_MODULE_SPECIFIERS.map((specifier, index) => {
        return `import * as m${index} from ${JSON.stringify(specifier)};`;
      });
      const moduleEntries = SHOWCASE_RUNTIME_MODULE_SPECIFIERS.map((specifier, index) => {
        return `  ${JSON.stringify(specifier)}:m${index},`;
      });
      const entryContent = [...imports, 'window.__modules__={', ...moduleEntries, '};'].join('\n');

      const result = await build({
        stdin: {
          contents: entryContent,
          loader: 'ts',
          resolveDir: __dirname,
        },
        bundle: true,
        format: 'iife',
        platform: 'browser',
        write: false,
        logLevel: 'silent',
        plugins: [vectraSourceEsbuildPlugin()],
      }).catch((err: unknown) => {
        this.error(`vectra sandbox 번들 빌드 실패: ${err instanceof Error ? err.message : String(err)}`);
      });

      const bundleText = result?.outputFiles[0]?.text;
      if (!bundleText) {
        this.error('vectra sandbox 번들 출력이 비어 있습니다');
      }

      cachedBundle = bundleText;
      return `export const VECTRA_SANDBOX_JS = ${JSON.stringify(cachedBundle)};`;
    },
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

function pixiSandboxPlugin(): Plugin {
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
          resolveDir: __dirname,
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

export default defineConfig({
  plugins: [react(), vectraSandboxPlugin(), pixiSandboxPlugin()],
  build: {
    chunkSizeWarningLimit: 8000,
  },
  resolve: {
    alias: [
      { find: '@repo/playground', replacement: playgroundSourceEntry },
      { find: /^@cp949\/vectra\/([^/]+)$/, replacement: `${vectraSourceDir}$1/index.ts` },
      { find: /^@cp949\/vectra\/([^/]+)\/(.+)$/, replacement: `${vectraSourceDir}$1/$2.ts` },
    ],
  },
});
