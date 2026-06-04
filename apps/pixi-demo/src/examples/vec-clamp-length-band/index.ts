import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Vec Clamp Length Band 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 455, y: 130 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Vec Clamp Length Band 예제 */
export const vecClampLengthBandExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vec-clamp-length-band',
  title: 'Vec Clamp Length Band',
  description:
    'origin에서 velocity handle을 drag하면 clampLengthInto가 방향은 보존하고 길이만 [min, max] band로 제한한다. band 안은 통과, 길면 max 링으로 pull-in, 짧으면 min 링으로 push-out한다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
