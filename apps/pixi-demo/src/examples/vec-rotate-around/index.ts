import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Vector Rotate Around 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 510, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Vector Rotate Around 예제 */
export const vecRotateAroundExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vec-rotate-around',
  title: 'Vector Rotate Around',
  description: '고정 pivot 기준으로 draggable source 점을 일정 각속도로 회전해 pivot 중심 orbit 위 위치를 본다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
