import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Angle Unit Compass 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 500, y: 160 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Angle Unit Compass 예제 */
export const angleUnitCompassExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'angle-unit-compass',
  title: 'Angle Unit Compass',
  description: 'compass pointer와 sector handle을 드래그해 angle 단위 변환, wrap, sector 포함, sin/cos 좌표를 비교한다',
  categoryId: 'angle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
