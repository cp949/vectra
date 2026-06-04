import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

const seed: PixiRuntimeSeed = {
  size: { width: 780, height: 520 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

export const segmentConstructionLabExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'segment-construction-lab',
  title: 'Segment Construction Lab',
  description: 'angle, circle diameter, midpoint, normal rib 방식으로 segment를 구성한다',
  categoryId: 'segment',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
