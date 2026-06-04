import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Path Fill Hit Test 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 70 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Path Fill Hit Test 예제 */
export const pathFillHitTestExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'path-fill-hit-test',
  title: 'Path Fill Hit Test',
  description:
    'probe 점을 drag하면 고정 closed path 내부인지 even-odd fill rule로 매 프레임 판정하고, 내부일 때 path fill이 hit 색으로 바뀐다',
  categoryId: 'path',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
