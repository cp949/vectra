import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Triangle Solver Excircles Lab 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 135, y: 330 }, b: { x: 345, y: 330 } },
  circle: { center: { x: 360, y: 220 }, radius: 72 },
};

/** Triangle Solver Excircles Lab 예제 */
export const triangleSolverExcirclesLabExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'triangle-solver-excircles-lab',
  title: 'Triangle Solver Excircles Lab',
  description: '삼각형 꼭짓점을 드래그해 SSS/ASA solver와 방심/방접원 관계를 비교한다',
  categoryId: 'triangle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
