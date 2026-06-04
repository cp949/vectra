import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Rotate Handle 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 380, y: 126 },
  segment: { a: { x: 290, y: 170 }, b: { x: 470, y: 300 } },
  circle: { center: { x: 380, y: 235 }, radius: 7 },
};

/** Rotate Handle 예제 */
export const rotateHandleExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'rotate-handle',
  title: 'Rotate Handle',
  description:
    'box 위 rotate handle을 드래그하면 center anchor를 pivot으로 box가 회전하고, 각도가 15° 격자에 가까우면 snap된다',
  categoryId: 'transform',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
