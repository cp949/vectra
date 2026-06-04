import type { PlaygroundExample } from '@repo/playground';
import type { ShowcaseRuntimeSeed } from '../../pixi/api';
import source from './source.exam.ts?raw';

export const arcDesignerExample: PlaygroundExample<ShowcaseRuntimeSeed> = {
  id: 'arc-designer',
  title: 'Arc Designer',
  description: 'Convert SVG endpoint arcs into center geometry and animate sweep.',
  categoryId: 'path-curve',
  source: { language: 'ts', code: source },
  imports: ['pixi.js', '@cp949/vectra/curve', '@cp949/vectra/svg-path'],
  runtimeSeed: { randomSeed: 20260523 },
};
