import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

const seed: PixiRuntimeSeed = {
  size: { width: 780, height: 520 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

export const raycastWorkbenchExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'raycast-workbench',
  title: 'Raycast Workbench',
  description: '같은 aim ray로 bounds, circle, wall segment, cubic path target을 비교한다',
  categoryId: 'ray',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
