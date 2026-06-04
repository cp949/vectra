import type { PlaygroundExample } from '@repo/playground';
import type { ShowcaseRuntimeSeed } from '../../pixi/api';
import source from './source.exam.ts?raw';

export const collisionPlaygroundExample: PlaygroundExample<ShowcaseRuntimeSeed> = {
  id: 'collision-playground',
  title: 'Collision Playground',
  description: 'Move shapes and inspect circle, rect, and segment intersections.',
  categoryId: 'game-geometry',
  source: { language: 'ts', code: source },
  imports: [
    'pixi.js',
    '@cp949/vectra/intersects',
    '@cp949/vectra/circle',
    '@cp949/vectra/rect',
    '@cp949/vectra/segment',
  ],
  runtimeSeed: { randomSeed: 20260523 },
};
