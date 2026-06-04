import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Grid Snap Bracket 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Grid Snap Bracket 예제 */
export const gridSnapBracketExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'grid-snap-bracket',
  title: 'Grid Snap Bracket',
  description: 'probe 값을 drag하면 값을 감싸는 grid 칸 경계(floor/ceil)와 가장 가까운 칸(nearest)을 본다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
