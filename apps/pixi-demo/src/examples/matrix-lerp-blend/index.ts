import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Matrix Lerp Blend 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 392 },
  segment: { a: { x: 220, y: 210 }, b: { x: 520, y: 210 } },
  circle: { center: { x: 360, y: 392 }, radius: 9 },
};

/** Matrix Lerp Blend 예제 */
export const matrixLerpBlendExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'matrix-lerp-blend',
  title: 'Matrix Lerp Blend',
  description:
    'slider t를 드래그하면 두 고정 keyframe transform을 component-wise 보간한 matrix로 도형이 변환되고, 중간 t에서 det가 떨어져 비강체로 수축한다',
  categoryId: 'transform',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
