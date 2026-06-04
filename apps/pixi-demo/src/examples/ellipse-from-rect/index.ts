import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Ellipse From Rect 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 470, y: 300 },
  segment: { a: { x: 250, y: 150 }, b: { x: 470, y: 300 } },
  circle: { center: { x: 360, y: 225 }, radius: 110 },
};

/** Ellipse From Rect 예제 */
export const ellipseFromRectExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'ellipse-from-rect',
  title: 'Ellipse From Rect',
  description:
    '박스 두 코너를 drag하면 그 박스에 내접하는 ellipse가 갱신되고, 코너를 반대편 너머로 끌면 반지름이 0으로 접힌다',
  categoryId: 'ellipse',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
