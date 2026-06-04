import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Weighted Loot Table 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Weighted Loot Table 예제 */
export const weightedLootTableExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'weighted-loot-table',
  title: 'Weighted Loot Table',
  description:
    'legendary 등급 가중치 노브를 끌면 각 등급의 경험적 드롭 빈도가 weight/total 목표 비율로 수렴함을 weightedChoice tally bar로 보인다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
