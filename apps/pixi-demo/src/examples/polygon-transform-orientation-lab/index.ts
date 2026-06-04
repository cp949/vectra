import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Polygon Transform Orientation Lab 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 780, height: 480 },
  pointer: { x: 600, y: 180 },
  segment: { a: { x: 160, y: 160 }, b: { x: 560, y: 320 } },
  circle: { center: { x: 390, y: 240 }, radius: 120 },
};

/** Polygon Transform Orientation Lab 예제 */
export const polygonTransformOrientationLabExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'polygon-transform-orientation-lab',
  title: 'Polygon Transform Orientation Lab',
  description: 'polygon 꼭짓점과 transform 핸들을 드래그해 복제 polygon의 이동, 변환, winding 변화를 비교한다',
  categoryId: 'polygon',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
