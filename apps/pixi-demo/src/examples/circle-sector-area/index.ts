import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Circle Sector Area 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 510, y: 230 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Circle Sector Area 예제 */
export const circleSectorAreaExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'circle-sector-area',
  title: 'Circle Sector Area',
  description:
    '끝 반지름 핸들 B를 원 둘레로 drag하면 고정 원의 두 반지름과 호가 둘러싼 부채꼴 넓이 A = ½·r²·|θ|를 매 drag마다 다시 구한다. θ가 커지면 채워진 부채꼴 영역과 넓이가 함께 자라고, θ→2π에서 전체 disk 넓이에 수렴한다',
  categoryId: 'circle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
