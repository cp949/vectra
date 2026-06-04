import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Vector Direction Slerp 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 510, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Vector Direction Slerp 예제 */
export const vecSlerpDirectionExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vec-slerp-direction',
  title: 'Vector Direction Slerp',
  description: '방향 handle A·B를 drag하면 보간된 방향이 두 방향 사이 최단 호를 일정 각속도로 왕복한다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
