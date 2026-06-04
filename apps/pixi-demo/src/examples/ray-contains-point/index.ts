import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Ray Contains Point 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 470, y: 150 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Ray Contains Point 예제 */
export const rayContainsPointExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'ray-contains-point',
  title: 'Ray Contains Point',
  description:
    '점 P를 드래그하면 P가 forward ray 위에 허용 오차(epsilon) 안에서, 그리고 origin 앞쪽(t>=0)에 놓였는지 containsPoint로 판정한다. 허용 band를 벗어나거나 origin 뒤로 끌면 off가 된다',
  categoryId: 'ray',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
