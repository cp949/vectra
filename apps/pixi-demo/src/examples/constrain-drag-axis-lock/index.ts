import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Constrain Drag Axis Lock 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Constrain Drag Axis Lock 예제 */
export const constrainDragAxisLockExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'constrain-drag-axis-lock',
  title: 'Constrain Drag Axis Lock',
  description:
    '박스를 drag하면 axisLock auto가 drag-start anchor 기준 우세 축(|dx|>|dy|이면 수평, 아니면 수직)으로 이동을 잠가 박스가 한 가이드 축 위에만 머문다. 우세 축이 바뀌면 잠금 축도 라이브로 뒤집힌다',
  categoryId: 'transform',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
