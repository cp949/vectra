import type { PlaygroundExample } from '@repo/playground';
import type { ShowcaseRuntimeSeed } from '../../pixi/api';
import source from './source.exam.ts?raw';

export const splineComparisonTableExample: PlaygroundExample<ShowcaseRuntimeSeed> = {
  id: 'spline-comparison-table',
  title: 'Spline Comparison Table',
  description: 'Compare Catmull-Rom, cardinal, and B-spline behavior interactively.',
  categoryId: 'curve-tools',
  source: { language: 'ts', code: source },
  imports: ['pixi.js', '@cp949/vectra/curve', '@cp949/vectra/interpolation'],
  runtimeSeed: { randomSeed: 20260523 },
};
