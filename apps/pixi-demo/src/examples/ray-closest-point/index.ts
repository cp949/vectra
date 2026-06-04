import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Ray Closest Point 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 470, y: 150 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Ray Closest Point 예제 */
export const rayClosestPointExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'ray-closest-point',
  title: 'Ray Closest Point',
  description:
    '점 P를 드래그하면 고정 forward ray 위 최근접점을 매번 다시 구하고, P가 origin 뒤로 가면 ray가 forward(t>=0)만 뻗으므로 발이 origin에 달라붙는다',
  categoryId: 'ray',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
