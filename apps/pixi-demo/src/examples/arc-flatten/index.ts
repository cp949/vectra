import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Arc Flatten 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 620, y: 180 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Arc Flatten 예제 */
export const arcFlattenExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'arc-flatten',
  title: 'Arc Flatten',
  description:
    'flatness 슬라이더를 drag해 고정 원호를 adaptive polyline으로 근사하고 segment 수와 arc gap 변화를 드러낸다',
  categoryId: 'curve',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
