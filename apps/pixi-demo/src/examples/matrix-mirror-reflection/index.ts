import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Matrix Mirror Reflection 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 496, y: 283 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Matrix Mirror Reflection 예제 */
export const matrixMirrorReflectionExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'matrix-mirror-reflection',
  title: 'Matrix Mirror Reflection',
  description: '거울 축 handle을 drag하면 pivot 통과 축에 대해 source 도형이 반사되고 det=-1로 winding이 뒤집힌다',
  categoryId: 'transform',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
