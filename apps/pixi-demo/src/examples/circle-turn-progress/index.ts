import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Circle Turn Progress 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 380 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Circle Turn Progress 예제 */
export const circleTurnProgressExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'circle-turn-progress',
  title: 'Circle Turn Progress',
  description:
    '하단 트랙의 노브를 드래그해 turn fraction t(0~1)를 정하면 pointAtTurn(circle, t)이 그 진행률에 해당하는 원 둘레 위 점을 매번 다시 구하고, turn=0에서 거기까지 호를 채워 progress ring을 그린다. 각도가 아니라 한 바퀴를 1로 정규화한 fraction으로 둘레 위치를 잡는 작업 흐름을 보인다',
  categoryId: 'circle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
