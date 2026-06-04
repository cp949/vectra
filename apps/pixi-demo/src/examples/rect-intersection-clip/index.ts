import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Rect Intersection Clip 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 300, y: 200 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Rect Intersection Clip 예제 */
export const rectIntersectionClipExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'rect-intersection-clip',
  title: 'Rect Intersection Clip',
  description:
    '박스 B를 drag하면 고정 프레임 A와 겹치는 클립 사각형을 매 프레임 계산해 강조하고, 겹치지 않으면 클립 영역이 사라진다',
  categoryId: 'rect',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
