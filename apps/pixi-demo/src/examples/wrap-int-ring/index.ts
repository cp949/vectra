import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Wrap Int Ring 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 392 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Wrap Int Ring 예제 */
export const wrapIntRingExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'wrap-int-ring',
  title: 'Wrap Int Ring',
  description: 'scrubber로 정수를 drag하면 ring 범위 밖 값도 cyclic wrap으로 슬롯 인덱스가 된다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
