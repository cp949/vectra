import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Rect Expand To Include Point 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 430, y: 280 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Rect Expand To Include Point 예제 */
export const rectExpandToIncludePointExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'rect-expand-to-include-point',
  title: 'Rect Expand To Include Point',
  description:
    '고정 base rect를 draggable point가 포함되도록 point 방향으로만 최소 확장하고 expand-only 정책을 드러낸다',
  categoryId: 'rect',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
