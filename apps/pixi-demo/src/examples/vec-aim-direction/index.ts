import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Vec Aim Direction 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 520, y: 150 },
  segment: { a: { x: 200, y: 330 }, b: { x: 560, y: 210 } },
  circle: { center: { x: 240, y: 280 }, radius: 0 },
};

/** Vec Aim Direction 예제 */
export const vecAimDirectionExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vec-aim-direction',
  title: 'Vec Aim Direction',
  description:
    'target 핸들을 drag하면 고정 source에서 target을 향하는 단위 방향 벡터를 다시 계산하고, 거리가 멀어져도 방향(unit)만 남아 aim arrow 길이가 일정함을 보인다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
