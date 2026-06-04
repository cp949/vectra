import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Rect Perimeter Walk 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Rect Perimeter Walk 예제 */
export const rectPerimeterWalkExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'rect-perimeter-walk',
  title: 'Rect Perimeter Walk',
  description: 't∈[0,1]을 균등 arclength로 rect 경계를 parameterize하고 marker가 clockwise로 순환한다',
  categoryId: 'rect',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
