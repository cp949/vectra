import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Pixel Grid Align 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 460 },
  pointer: { x: 295, y: 195 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Pixel Grid Align 예제 */
export const pixelGridAlignExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'pixel-grid-align',
  title: 'Pixel Grid Align',
  description:
    'raw point를 드래그하면 좌표가 device pixel 격자(간격 1/dpr)에 가장 가깝게 정렬되고, 아래 knob으로 dpr(1·2·3)을 바꾸면 격자 간격과 정렬 결과가 달라진다 (pixelAlign semantic)',
  categoryId: 'transform',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
