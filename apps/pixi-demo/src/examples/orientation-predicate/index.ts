import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Orientation Predicate 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 380, y: 330 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Orientation Predicate 예제 */
export const orientationPredicateExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'orientation-predicate',
  title: 'Orientation Predicate',
  description:
    'probe C를 drag하면 직선 A→B 기준 orientation 부호로 ccw/cw/on을 판정하고 삼각형 ABC를 winding 색으로 칠한다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
