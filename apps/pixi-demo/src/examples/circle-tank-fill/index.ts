import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Circle Tank Fill 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 280 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Circle Tank Fill 예제 */
export const circleTankFillExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'circle-tank-fill',
  title: 'Circle Tank Fill',
  description:
    '원통 탱크 단면의 수위 선을 위아래로 드래그하면 수면 아래 잠긴 활꼴(circular segment) 단면적을 segmentArea(circle, θ)로 매번 다시 구하고, 채워진 영역과 채움 비율이 함께 바뀐다',
  categoryId: 'circle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
