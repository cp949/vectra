import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Bilinear Warp Grid 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Bilinear Warp Grid 예제 */
export const bilinearWarpGridExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'bilinear-warp-grid',
  title: 'Bilinear Warp Grid',
  description: 'quad의 corner 4개를 drag하면 unit grid가 bilinear 보간으로 quad 안에 매핑된다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
