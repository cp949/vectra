import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Vec Point On Ray 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 470, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Vec Point On Ray 예제 */
export const vecPointOnRayExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vec-point-on-ray',
  title: 'Vec Point On Ray',
  description:
    '고정 origin에서 방향 handle을 drag하면 ray 각도가 바뀌고, distance가 음수↔양수로 왕복하면 marker가 ray 위를 부호 거리만큼 미끄러진다. 방향은 정규화되어 handle 거리는 무시된다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
