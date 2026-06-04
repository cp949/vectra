import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Vec Set Length 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 455, y: 130 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Vec Set Length 예제 */
export const vecSetLengthExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vec-set-length',
  title: 'Vec Set Length',
  description:
    'velocity handle을 drag하면 setLengthInto가 방향은 보존하고 길이만 고정 SPEED로 덮어쓴다. 결과 marker는 입력 길이와 무관하게 항상 반지름 SPEED 링 위에 놓인다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
