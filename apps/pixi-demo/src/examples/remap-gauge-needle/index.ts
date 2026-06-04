import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Remap Gauge Needle 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 360 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Remap Gauge Needle 예제 */
export const remapGaugeNeedleExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'remap-gauge-needle',
  title: 'Remap Gauge Needle',
  description:
    '수평 트랙의 노브를 좌우로 드래그하면 그 px 위치를 remap(knobX, 트랙범위, 각도범위)으로 게이지 바늘 각도로 변환한다. 노브를 트랙 밖으로 끌면 remap이 clamp 없이 외삽해 바늘이 호 밖으로 나가고, clamp를 거친 marker는 호 끝에 고정돼 두 정책을 대비한다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
