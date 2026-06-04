import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

const seed: PixiRuntimeSeed = {
  size: { width: 780, height: 520 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

export const vectorControlWorkbenchExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vector-control-workbench',
  title: 'Vector Control Workbench',
  description: 'aim direction, ray distance, set length, clamp length를 같은 vector control 흐름에서 비교한다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
