import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** SVG Points Roundtrip Editor 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 760, height: 460 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 120, y: 320 }, b: { x: 640, y: 160 } },
  circle: { center: { x: 380, y: 230 }, radius: 70 },
};

/** SVG Points Roundtrip Editor 예제 */
export const svgPointsRoundtripEditorExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'svg-points-roundtrip-editor',
  title: 'SVG Points Roundtrip Editor',
  description: 'SVG polygon/polyline points 문자열을 파싱하고 꼭짓점 편집 후 다시 직렬화한다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
