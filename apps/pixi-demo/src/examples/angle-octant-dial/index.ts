import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Angle Octant Dial 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 520, y: 130 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Angle Octant Dial 예제 */
export const angleOctantDialExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'angle-octant-dial',
  title: 'Angle Octant Dial',
  description:
    '입력 needle 핸들을 피벗 둘레로 drag하면 octant가 그 방향이 8개 45° 부채꼴 중 어느 등분면(0..7)에 속하는지 분류해 활성 부채꼴 하나만 강조한다. needle은 항상 강조 부채꼴 안에 놓인다',
  categoryId: 'angle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
