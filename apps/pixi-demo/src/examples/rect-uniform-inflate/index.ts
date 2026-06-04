import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Rect Uniform Inflate 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 470, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Rect Uniform Inflate 예제 */
export const rectUniformInflateExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'rect-uniform-inflate',
  title: 'Rect Uniform Inflate',
  description:
    '고정 base rect에 handle을 drag하면 단일 amount로 사방을 동일하게 inflate/deflate하고 음수 크기 붕괴 정책을 드러낸다',
  categoryId: 'rect',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
