// 예제 카탈로그 정적 레지스트리
// 새 예제를 추가할 때 import를 추가하고 EXAMPLES 배열에 항목을 넣는다
import type { PlaygroundCategory, PlaygroundExample } from '@repo/playground';
import type { CanvasRuntimeSeed } from '../canvas/api';
import { adapterInteropExample } from './adapter-interop';
import { arcLengthProbeExample } from './arc-length-probe';
import { matrixTransformExample } from './matrix-transform';
import { matrixViewportFitExample } from './matrix-viewport-fit';
import { polygonHitTestExample } from './polygon-hit-test';
import { quickStartExample } from './quick-start';
import { randomBoundarySamplingExample } from './random-boundary-sampling';
import { randomDistributionSamplingExample } from './random-distribution-sampling';
import { randomSamplingExample } from './random-sampling';
import { segmentSnapExample } from './segment-snap';
import { selectionBoundsExample } from './selection-bounds';

/** 예제 카테고리 목록 */
export const CATEGORIES: PlaygroundCategory[] = [
  { id: 'getting-started', title: '시작하기', order: 0, defaultExpanded: true },
  { id: 'interaction', title: '인터랙션', order: 1, defaultExpanded: true },
  { id: 'transform', title: '변환', order: 2 },
  { id: 'random', title: '랜덤', order: 3 },
  { id: 'curve', title: '커브', order: 4 },
  { id: 'path', title: '패스', order: 5 },
  { id: 'math', title: '수학', order: 6 },
  { id: 'line', title: '라인', order: 7 },
  { id: 'measurement', title: '측정', order: 8 },
  { id: 'geometry', title: '기하', order: 9 },
];

/** 예제 목록 */
export const EXAMPLES: PlaygroundExample<CanvasRuntimeSeed>[] = [
  quickStartExample,
  adapterInteropExample,
  segmentSnapExample,
  selectionBoundsExample,
  polygonHitTestExample,
  matrixTransformExample,
  matrixViewportFitExample,
  randomSamplingExample,
  randomDistributionSamplingExample,
  randomBoundarySamplingExample,
  arcLengthProbeExample,
];
