import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import {
  DEMO_CHUNK_SIZE_WARNING_LIMIT,
  demoResolveAliases,
  pixiSandboxPlugin,
  vectraSandboxPlugin,
} from '../../sub/playground/vite/index';
import { PIXI_RUNTIME_MODULE_SPECIFIERS } from './src/sandbox/pixi-module-specifiers';

const appDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    vectraSandboxPlugin({ appDir, specifiers: PIXI_RUNTIME_MODULE_SPECIFIERS }),
    pixiSandboxPlugin({ appDir }),
  ],
  build: { chunkSizeWarningLimit: DEMO_CHUNK_SIZE_WARNING_LIMIT },
  resolve: { alias: demoResolveAliases() },
});
