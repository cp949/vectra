import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Vec Midpoint 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 520, y: 160 },
  segment: { a: { x: 200, y: 300 }, b: { x: 520, y: 160 } },
  circle: { center: { x: 360, y: 230 }, radius: 0 },
};

/** Vec Midpoint 예제 */
export const vecMidpointExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vec-midpoint',
  title: 'Vec Midpoint',
  description:
    'point 핸들 B를 drag하면 고정 anchor A와 B의 중점 M을 다시 계산하고, 양쪽 절반 길이(|AM|, |MB|)가 항상 같아 두 점의 중심(center)임을 보인다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
