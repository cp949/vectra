import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Rect Layout Workbench 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 780, height: 500 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Rect Layout Workbench 예제 */
export const rectLayoutWorkbenchExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'rect-layout-workbench',
  title: 'Rect Layout Workbench',
  description: 'include point, inflate, split panes, union bounds를 같은 layout/debug board에서 비교한다',
  categoryId: 'rect',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
