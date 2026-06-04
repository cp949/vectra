import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

const seed: PixiRuntimeSeed = {
  size: { width: 780, height: 520 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

export const circularMeasurementLabExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'circular-measurement-lab',
  title: 'Circular Measurement Lab',
  description: '호 높이, 부채꼴 넓이, turn 위치, orbit segment 관계를 같은 원 작업판에서 비교한다',
  categoryId: 'circle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
