import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Editor Snap Guides Lab 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 760, height: 460 },
  pointer: { x: 356, y: 232 },
  segment: { a: { x: 168, y: 324 }, b: { x: 604, y: 154 } },
  circle: { center: { x: 356, y: 232 }, radius: 11 },
};

/** Editor Snap Guides Lab 예제 */
export const editorSnapGuidesLabExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'editor-snap-guides-lab',
  title: 'Editor Snap Guides Lab',
  description: '점 handle을 드래그해 grid, alignment guide, vertex, segment 후보 중 실제 snap 결과를 비교한다',
  categoryId: 'transform',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
