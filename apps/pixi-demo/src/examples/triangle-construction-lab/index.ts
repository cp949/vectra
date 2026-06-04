import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

const seed: PixiRuntimeSeed = {
  size: { width: 780, height: 560 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

export const triangleConstructionLabExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'triangle-construction-lab',
  title: 'Triangle Construction Lab',
  description: 'equilateral, right, base/apex, base/height, centers, side classification을 비교한다',
  categoryId: 'triangle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
