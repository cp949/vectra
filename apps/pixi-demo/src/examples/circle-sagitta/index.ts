import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Circle Sagitta 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 470, y: 150 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Circle Sagitta 예제 */
export const circleSagittaExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'circle-sagitta',
  title: 'Circle Sagitta',
  description:
    '호 끝점 핸들 B를 원 둘레로 드래그하면 그 호의 중심각 θ에 대응하는 활꼴 높이(sagitta) h = r(1−cos(θ/2))를 매번 다시 구하고, 현 중점에서 호 정점까지 그린 선분 길이가 곧 반환된 h다',
  categoryId: 'circle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
