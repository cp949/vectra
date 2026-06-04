import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Rect Contains Rect 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 290, y: 160 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Rect Contains Rect 예제 */
export const rectContainsRectExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'rect-contains-rect',
  title: 'Rect Contains Rect',
  description:
    '박스 B를 drag하면 고정 부모 프레임 A 안에 완전히 들어오는지 매 프레임 판정하고, 네 변 부등식이 모두 성립할 때 contained 색으로 바뀐다',
  categoryId: 'rect',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
