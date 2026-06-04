import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Angle Bisect Shortest 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 520, y: 130 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Angle Bisect Shortest 예제 */
export const angleBisectShortestExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'angle-bisect-shortest',
  title: 'Angle Bisect Shortest',
  description:
    '입력 ray 핸들을 피벗 둘레로 drag하면 bisectAngle이 고정 기준 ray와 입력 ray 사이의 더 짧은 호를 절반으로 가르는 이등분 각을 다시 계산한다. 이등분선은 항상 짧은 호 한가운데에 놓인다',
  categoryId: 'angle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
