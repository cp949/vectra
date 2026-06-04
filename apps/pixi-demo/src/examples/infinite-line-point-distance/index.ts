import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Infinite Line Point Distance 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 540, y: 130 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Infinite Line Point Distance 예제 */
export const infiniteLinePointDistanceExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'infinite-line-point-distance',
  title: 'Infinite Line Point Distance',
  description:
    '점 P를 드래그하면 고정 무한 직선(양방향 guide line)까지의 부호 없는 수직 거리(distanceToPoint)를 매 프레임 다시 계산하고, 직선에 가까워지면 contact 색으로 바뀐다. 영역 clearance와 달리 무한 직선은 내부가 없어 거리 0이 직선 위 한 점뿐이다',
  categoryId: 'line',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
