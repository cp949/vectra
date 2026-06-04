import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Infinite Line Diagnostics Lab 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 760, height: 460 },
  pointer: { x: 380, y: 230 },
  segment: { a: { x: 105, y: 315 }, b: { x: 430, y: 140 } },
  circle: { center: { x: 560, y: 250 }, radius: 72 },
};

/** Infinite Line Diagnostics Lab 예제 */
export const infiniteLineDiagnosticsLabExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'infinite-line-diagnostics-lab',
  title: 'Infinite Line Diagnostics Lab',
  description: '두 무한선과 probe point를 드래그해 projection, side, 단일 교점 상태를 진단한다',
  categoryId: 'line',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
