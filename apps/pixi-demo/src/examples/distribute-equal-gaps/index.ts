import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Distribute Equal Gaps 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Distribute Equal Gaps 예제 */
export const distributeEqualGapsExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'distribute-equal-gaps',
  title: 'Distribute Equal Gaps',
  description:
    '오른쪽 anchor 박스를 drag하면 distributeEquallyInto가 양 끝 박스 사이 중간 박스들을 인접 간격이 균등(gap-x)해지는 target 위치로 재분배한다. anchor를 가깝게 끌면 간격이 줄다가 중간 박스들이 겹치며 음수가 된다',
  categoryId: 'transform',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
