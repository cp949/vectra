import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import {
  DEMO_CHUNK_SIZE_WARNING_LIMIT,
  demoResolveAliases,
  vectraSandboxPlugin,
} from '../../sub/playground/vite/index';
import { VECTRA_SANDBOX_BARREL_SPECIFIERS } from './src/sandbox/vectra-sandbox-specifiers';

const appDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react(), vectraSandboxPlugin({ appDir, specifiers: VECTRA_SANDBOX_BARREL_SPECIFIERS })],
  build: { chunkSizeWarningLimit: DEMO_CHUNK_SIZE_WARNING_LIMIT },
  resolve: { alias: demoResolveAliases() },
});
