import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Angle Average Direction 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 520, y: 130 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Angle Average Direction 예제 */
export const angleAverageDirectionExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'angle-average-direction',
  title: 'Angle Average Direction',
  description:
    'ring 위 방향 핸들 3개를 drag하면 averageAngle이 세 방향각의 원형 평균(circular mean) 방향을 밝은 needle로 다시 그린다. 같은 입력의 단순 산술평균 ghost needle과 대비해, ±180° 경계를 넘는 방향에서는 산술평균이 어긋나고 원형 평균이 올바른 합성 방향을 가리키는 것을 보인다',
  categoryId: 'angle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
