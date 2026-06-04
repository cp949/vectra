import type { PlaygroundExample } from '@repo/playground';
import type { ShowcaseRuntimeSeed } from '../../pixi/api';
import source from './source.exam.ts?raw';

export const pathMorphStageExample: PlaygroundExample<ShowcaseRuntimeSeed> = {
  id: 'path-morph-stage',
  title: 'Path Morph Stage',
  description: 'Morph between normalized paths with easing.',
  categoryId: 'motion',
  source: { language: 'ts', code: source },
  imports: ['pixi.js', '@cp949/vectra/path', '@cp949/vectra/easing', '@cp949/vectra/interpolation'],
  runtimeSeed: { randomSeed: 20260523 },
};
