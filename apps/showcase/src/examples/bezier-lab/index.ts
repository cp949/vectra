import type { PlaygroundExample } from '@repo/playground';
import type { ShowcaseRuntimeSeed } from '../../pixi/api';
import source from './source.exam.ts?raw';

export const bezierLabExample: PlaygroundExample<ShowcaseRuntimeSeed> = {
  id: 'bezier-lab',
  title: 'Bezier Lab',
  description: 'Edit cubic control points with tangent, normal, hull, and bounds overlays.',
  categoryId: 'curve-tools',
  source: { language: 'ts', code: source },
  imports: ['pixi.js', '@cp949/vectra/curve', '@cp949/vectra/bounds'],
  runtimeSeed: { randomSeed: 20260523 },
};
