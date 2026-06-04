import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

const seed: PixiRuntimeSeed = {
  size: { width: 780, height: 520 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

export const rotationControlDialExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'rotation-control-dial',
  title: 'Rotation Control Dial',
  description: '회전 핸들에서 평균 방향, 이등분, clamp, snap, sweep 판정을 비교한다',
  categoryId: 'angle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
