import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Triangle Centers 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 200, y: 110 }, b: { x: 560, y: 250 } },
  circle: { center: { x: 340, y: 240 }, radius: 8 },
};

/** Triangle Centers 예제 */
export const triangleCentersExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'triangle-centers',
  title: 'Triangle Centers',
  description: '꼭짓점을 드래그하면 centroid/incenter/circumcenter와 incircle/circumcircle이 실시간 갱신된다',
  categoryId: 'triangle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
