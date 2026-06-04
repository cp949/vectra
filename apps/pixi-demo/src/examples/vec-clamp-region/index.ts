import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Vec Clamp Region 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 450, y: 160 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Vec Clamp Region 예제 */
export const vecClampRegionExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vec-clamp-region',
  title: 'Vec Clamp Region',
  description:
    'handle을 drag하면 clampInto가 좌표를 고정 사각 영역의 min/max로 성분별 clamp한다. handle을 region 밖으로 끌어도 marker는 항상 region 안(경계 포함)에 머문다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
