import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Stepped Timing Track 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 360 },
  segment: { a: { x: 120, y: 360 }, b: { x: 600, y: 360 } },
  circle: { center: { x: 360, y: 360 }, radius: 9 },
};

/** Stepped Timing Track 예제 */
export const steppedTimingTrackExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'stepped-timing-track',
  title: 'Stepped Timing Track',
  description: 'count handle을 drag해 등속 t를 계단형 steps() timing으로 바꾸고 marker가 N칸만 밟아 이동하는 것을 본다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
