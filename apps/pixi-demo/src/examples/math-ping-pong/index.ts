import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Math Ping Pong 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 388 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Math Ping Pong 예제 */
export const mathPingPongExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'math-ping-pong',
  title: 'Math Ping Pong',
  description:
    'scrubber로 입력 raw를 드래그하면 pingPong(raw, L)이 값을 [0, L]로 접어, 상한에서 wrap(점프)이 아니라 reflect(되돌림)하는 삼각파 왕복 값을 만든다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
