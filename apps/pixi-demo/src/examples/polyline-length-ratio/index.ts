import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Polyline Length Ratio 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 300, y: 300 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Polyline Length Ratio 예제 */
export const polylineLengthRatioExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'polyline-length-ratio',
  title: 'Polyline Length Ratio',
  description:
    'ratio 0→1을 등속으로 올려 segment 길이가 제각각인 polyline 위 marker를 등거리로 걷게 하고 등비율 ghost dot으로 uniform-by-distance를 드러낸다',
  categoryId: 'path',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
