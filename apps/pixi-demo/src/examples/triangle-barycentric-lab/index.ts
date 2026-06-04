import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Triangle Barycentric Lab 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 760, height: 460 },
  pointer: { x: 380, y: 235 },
  segment: { a: { x: 180, y: 360 }, b: { x: 590, y: 150 } },
  circle: { center: { x: 380, y: 230 }, radius: 120 },
};

/** Triangle Barycentric Lab 예제 */
export const triangleBarycentricLabExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'triangle-barycentric-lab',
  title: 'Triangle Barycentric Lab',
  description: 'probe 점과 꼭짓점을 드래그하며 barycentric 좌표, altitude, orientation을 확인한다',
  categoryId: 'triangle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
