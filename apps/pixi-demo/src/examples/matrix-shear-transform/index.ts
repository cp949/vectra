import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Matrix Shear Transform 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 420, y: 150 },
  segment: { a: { x: 280, y: 150 }, b: { x: 440, y: 330 } },
  circle: { center: { x: 360, y: 150 }, radius: 8 },
};

/** Matrix Shear Transform 예제 */
export const matrixShearTransformExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'matrix-shear-transform',
  title: 'Matrix Shear Transform',
  description: '상단 edge handle을 좌우로 드래그하면 base 행을 축으로 사각형이 수평 shear되어 평행사변형이 된다',
  categoryId: 'transform',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
