import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Cursor Chase 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 520, y: 160 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Cursor Chase 예제 */
export const cursorChaseExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'cursor-chase',
  title: 'Cursor Chase',
  description:
    '추적 마커가 cursor를 향해 고정 최대 거리만큼 따라오고, 도착 반경 안에서는 overshoot 없이 cursor에 붙어 멈춘다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
