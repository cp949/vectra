import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Path Morph 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 140, y: 340 }, b: { x: 580, y: 340 } },
  circle: { center: { x: 360, y: 220 }, radius: 120 },
};

/** Path Morph 예제 */
export const pathMorphExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'path-morph',
  title: 'Path Morph',
  description: '두 SVG path command list를 정규화하고 segment 수를 맞춘 뒤 easing된 진행도로 morph한다',
  categoryId: 'path',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
