import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Cross-Track Deviation 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 446, y: 150 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Cross-Track Deviation 예제 */
export const crossTrackDeviationExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'cross-track-deviation',
  title: 'Cross-Track Deviation',
  description:
    '화면을 가로지르는 고정 진행선 위를 따라가야 하는 차량을 드래그하면, anchor→차량 변위에서 진행 방향 성분을 제거한 수직 편차(rejectFrom)가 진행선까지의 직각 거리(cross-track error)로 나타난다. 차량에서 편차를 빼면 진행선 위 최근접점(foot)이다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
