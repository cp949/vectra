import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Ellipse Inspector 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 510, y: 180 },
  segment: { a: { x: 150, y: 330 }, b: { x: 570, y: 140 } },
  circle: { center: { x: 360, y: 220 }, radius: 110 },
};

/** Ellipse Inspector 예제 */
export const ellipseInspectorExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'ellipse-inspector',
  title: 'Ellipse Inspector',
  description: 'probe 점과 반지름 핸들을 드래그하며 ellipse closest point, 초점, tangent/normal을 확인한다',
  categoryId: 'ellipse',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
