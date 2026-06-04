import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Rotated Box AABB 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 460 },
  pointer: { x: 360, y: 240 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Rotated Box AABB 예제 */
export const boundsRotatedAabbExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'bounds-rotated-aabb',
  title: 'Rotated Box AABB',
  description:
    '회전 handle로 각도를 바꾸면 고정 사각형이 중심을 기준으로 회전하고, 회전된 꼭짓점을 감싸는 axis-aligned bounding box가 다시 계산된다 (broad-phase / dirty-rect)',
  categoryId: 'rect',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
