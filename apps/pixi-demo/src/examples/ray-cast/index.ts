import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Ray-Cast Visibility 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 330 },
  segment: { a: { x: 20, y: 420 }, b: { x: 700, y: 420 } },
  circle: { center: { x: 360, y: 330 }, radius: 7 },
};

/** Ray-Cast Visibility 예제 */
export const rayCastExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'ray-cast',
  title: 'Ray-Cast Visibility',
  description: '광원을 드래그하면 사방으로 쏜 광선이 벽에 닿는 nearest hit을 이어 가시 영역을 그린다',
  categoryId: 'ray',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
