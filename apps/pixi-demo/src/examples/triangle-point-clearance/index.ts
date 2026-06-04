import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Triangle Point Clearance 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 620, y: 110 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Triangle Point Clearance 예제 */
export const trianglePointClearanceExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'triangle-point-clearance',
  title: 'Triangle Point Clearance',
  description:
    'point 핸들을 드래그하면 고정 삼각형 keep-out 영역까지의 부호 없는 최단 여유 거리(clearance)를 매 프레임 다시 계산하고, 점이 영역 안으로 들어가면 거리 0이 되어 contact 색으로 바뀐다',
  categoryId: 'triangle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
