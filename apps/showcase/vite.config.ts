import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import {
  DEMO_CHUNK_SIZE_WARNING_LIMIT,
  demoResolveAliases,
  pixiSandboxPlugin,
  vectraSandboxPlugin,
} from '../../sub/playground/vite/index';
import { SHOWCASE_RUNTIME_MODULE_SPECIFIERS } from './src/sandbox/pixi-module-specifiers';

const appDir = fileURLToPath(new URL('.', import.meta.url));

/** GitHub Pages 프로젝트 사이트의 base. 저장소 이름과 같다 */
const PAGES_BASE = '/vectra/';

// `vite build --mode pages`만 Pages base를 쓴다. dev와 일반 build는 `/`다.
export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? PAGES_BASE : '/',
  plugins: [
    react(),
    vectraSandboxPlugin({ appDir, specifiers: SHOWCASE_RUNTIME_MODULE_SPECIFIERS }),
    pixiSandboxPlugin({ appDir }),
  ],
  build: { chunkSizeWarningLimit: DEMO_CHUNK_SIZE_WARNING_LIMIT },
  resolve: { alias: demoResolveAliases() },
}));
