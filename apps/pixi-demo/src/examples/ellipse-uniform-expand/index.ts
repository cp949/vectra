import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Ellipse Uniform Expand 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 660, y: 160 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Ellipse Uniform Expand 예제 */
export const ellipseUniformExpandExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'ellipse-uniform-expand',
  title: 'Ellipse Uniform Expand',
  description:
    '세로 트랙 handle을 drag하면 단일 delta로 ellipse 두 반지름을 동시에 확장/축소하고 0-clamp 붕괴 정책을 드러낸다',
  categoryId: 'ellipse',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
