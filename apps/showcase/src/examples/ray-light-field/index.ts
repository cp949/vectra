import type { PlaygroundExample } from '@repo/playground';
import type { ShowcaseRuntimeSeed } from '../../pixi/api';
import source from './source.exam.ts?raw';

export const rayLightFieldExample: PlaygroundExample<ShowcaseRuntimeSeed> = {
  id: 'ray-light-field',
  title: 'Ray Light Field',
  description: 'Drag a light source through walls and visibility rays.',
  categoryId: 'game-geometry',
  source: { language: 'ts', code: source },
  imports: ['pixi.js', '@cp949/vectra/ray', '@cp949/vectra/segment', '@cp949/vectra/intersects'],
  runtimeSeed: { randomSeed: 20260523 },
};
