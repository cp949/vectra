import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Content Fit Workbench 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 760, height: 460 },
  pointer: { x: 560, y: 260 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Content Fit Workbench 예제 */
export const contentFitWorkbenchExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'content-fit-workbench',
  title: 'Content Fit Workbench',
  description: '같은 프레임 크기에서 contain은 전체 콘텐츠를 보존하고 cover는 프레임을 채우며 넘친 영역을 crop한다',
  categoryId: 'transform',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
