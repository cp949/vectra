import type { PlaygroundExample } from '@repo/playground';
import type { ShowcaseRuntimeSeed } from '../../pixi/api';
import source from './source.exam.ts?raw';

export const transformHandlesStudioExample: PlaygroundExample<ShowcaseRuntimeSeed> = {
  id: 'transform-handles-studio',
  title: 'Transform Handles Studio',
  description: 'Resize and transform a shape through handles and matrices.',
  categoryId: 'editor-tools',
  source: { language: 'ts', code: source },
  imports: ['pixi.js', '@cp949/vectra/editor-geometry', '@cp949/vectra/matrix', '@cp949/vectra/bounds'],
  runtimeSeed: { randomSeed: 20260523 },
};
