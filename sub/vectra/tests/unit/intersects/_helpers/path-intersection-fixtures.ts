/**
 * path 교차 테스트에서 공유하는 기준 path fixture.
 */
import type { PathCommand } from '../../../../src/types';

// 정사각형 path (0,0)-(4,0)-(4,4)-(0,4), open (CloseCommand 없음)
// edge: (0,0)->(4,0), (4,0)->(4,4), (4,4)->(0,4), 마지막->첫 edge 없음
export const squarePath: PathCommand[] = [
  { kind: 'move', x: 0, y: 0 },
  { kind: 'line', x: 4, y: 0 },
  { kind: 'line', x: 4, y: 4 },
  { kind: 'line', x: 0, y: 4 },
];

// 정사각형 path (closed)
export const squareClosedPath: PathCommand[] = [
  { kind: 'move', x: 0, y: 0 },
  { kind: 'line', x: 4, y: 0 },
  { kind: 'line', x: 4, y: 4 },
  { kind: 'line', x: 0, y: 4 },
  { kind: 'close' },
];

// 정사각형 closed path (0,0)-(10,0)-(10,10)-(0,10)
export const bigSquarePath: PathCommand[] = [
  { kind: 'move', x: 0, y: 0 },
  { kind: 'line', x: 10, y: 0 },
  { kind: 'line', x: 10, y: 10 },
  { kind: 'line', x: 0, y: 10 },
  { kind: 'close' },
];
