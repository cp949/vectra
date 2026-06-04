import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Ellipse Foci Sum 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 160 },
  segment: { a: { x: 240, y: 220 }, b: { x: 480, y: 220 } },
  circle: { center: { x: 360, y: 220 }, radius: 130 },
};

/** Ellipse Foci Sum 예제 */
export const ellipseFociSumExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'ellipse-foci-sum',
  title: 'Ellipse Foci Sum',
  description: '두 초점과 경계 handle의 거리합으로 axis-aligned ellipse를 구성한다',
  categoryId: 'ellipse',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
