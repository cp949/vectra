import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Triangle Build Right 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 530, y: 250 },
  segment: { a: { x: 360, y: 300 }, b: { x: 530, y: 250 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Triangle Build Right 예제 */
export const triangleBuildRightExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'triangle-build-right',
  title: 'Triangle Build Right',
  description:
    '정점 B 핸들을 직각 vertex A 둘레로 drag하면 한 leg 길이와 방향으로 직각삼각형이 구성되고 A의 직각이 항상 90°임을 보인다',
  categoryId: 'triangle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
