import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Circle Tangent Construction 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 180, y: 240 }, b: { x: 320, y: 120 } },
  circle: { center: { x: 180, y: 240 }, radius: 70 },
};

/** Circle Tangent Construction 예제 */
export const circleTangentConstructionExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'circle-tangent-construction',
  title: 'Circle Tangent Construction',
  description: '외부 점에서 원으로의 접선과 두 원의 공통접선(outer/inner)을 드래그로 실시간 작도한다',
  categoryId: 'circle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
