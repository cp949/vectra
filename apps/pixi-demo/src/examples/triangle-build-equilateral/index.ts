import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Triangle Build Equilateral 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 510, y: 190 },
  segment: { a: { x: 360, y: 250 }, b: { x: 510, y: 190 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Triangle Build Equilateral 예제 */
export const triangleBuildEquilateralExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'triangle-build-equilateral',
  title: 'Triangle Build Equilateral',
  description:
    '정점 B 핸들을 origin 둘레로 drag하면 한 변 길이와 방향으로 정삼각형이 구성되고 세 변이 항상 같은 길이임을 보인다',
  categoryId: 'triangle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
