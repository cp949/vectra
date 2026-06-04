import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Bias Curve 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 345, y: 400 },
  segment: { a: { x: 120, y: 330 }, b: { x: 600, y: 330 } },
  circle: { center: { x: 345, y: 400 }, radius: 7 },
};

/** Bias Curve 예제 */
export const easingBiasCurveExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'easing-bias-curve',
  title: 'Bias Curve',
  description: 'b 파라미터 핸들을 drag하면 bias(t, b) 곡선이 저값 또는 고값 쪽으로 휘는 변화를 확인한다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
