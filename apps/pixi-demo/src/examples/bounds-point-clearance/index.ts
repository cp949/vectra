import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Bounds Point Clearance 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 560, y: 110 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Bounds Point Clearance 예제 */
export const boundsPointClearanceExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'bounds-point-clearance',
  title: 'Bounds Point Clearance',
  description:
    '질의 점 P를 drag하면 고정 사각 keep-out 영역(AABB)까지의 부호 없는 최단 여유 거리(clearance)를 매 프레임 다시 계산한다. P가 밖이면 둘레까지의 gap이 곧 그 거리이고, 안으로 끌면 거리가 0이 되어 contact 색으로 전환된다',
  categoryId: 'rect',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
