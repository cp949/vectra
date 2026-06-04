import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Easing Motion Timing 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 360 },
  segment: { a: { x: 120, y: 360 }, b: { x: 600, y: 360 } },
  circle: { center: { x: 360, y: 360 }, radius: 9 },
};

/** Easing Motion Timing 예제 */
export const easingMotionTimingExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'easing-motion-timing',
  title: 'Easing Motion Timing',
  description: '선택된 easing 함수로 segment 위 marker를 구동하고 등속 marker와 비교하며 곡선을 그린다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
