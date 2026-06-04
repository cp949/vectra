import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Sample Table Lookup 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 352 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Sample Table Lookup 예제 */
export const sampleTableLookupExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'sample-table-lookup',
  title: 'Sample Table Lookup',
  description: 'probe를 가로 트랙에서 drag하면 균등 간격 sample 표에서 그 t 위치 값을 linear 보간 조회한다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
