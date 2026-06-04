import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Random Point On Segment 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Random Point On Segment 예제 */
export const randomPointOnSegmentExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'random-point-on-segment',
  title: 'Random Point On Segment',
  description:
    '고정 spawn edge(선분) 위에 매 프레임 균일 난수 점을 흩뿌린다. 끝점 핸들을 drag하면 새 점들이 live 선분을 따라 균일하게 emit되어 "선분을 따라 파티클을 균일하게 뿌린다"는 작업 흐름을 보인다',
  categoryId: 'segment',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
