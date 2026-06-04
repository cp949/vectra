import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Circle Point Clearance 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 470, y: 150 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Circle Point Clearance 예제 */
export const circlePointClearanceExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'circle-point-clearance',
  title: 'Circle Point Clearance',
  description:
    'point 핸들을 드래그하면 고정 원형 keep-out zone까지의 여유 거리(clearance)를 매 프레임 다시 계산하고, 점이 zone 안으로 들어가면 거리 0이 되어 contact 색으로 바뀐다',
  categoryId: 'circle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
