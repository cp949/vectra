/** 다각형 계산과 출력 계약을 검증한다. */
import type { Polygon, SegmentWritable, PointWritable } from '../../../src/types/flat-shapes.internal';

export const EMPTY: Polygon = [];
export const SINGLE: Polygon = [5, 7];
export const TWO_PT: Polygon = [0, 0, 3, 4];

// 수학적 y-up 좌표계 기준 counter-clockwise 3-4-5 삼각형 -> signedArea > 0.
export const CCW_TRI: Polygon = [0, 0, 4, 0, 0, 3];

export const UNIT_SQUARE: Polygon = [0, 0, 1, 0, 1, 1, 0, 1];

export const REPEATED_PT: Polygon = [0, 0, 0, 0, 1, 0];

export function makePoint(): PointWritable {
  return { x: 0, y: 0 };
}

export function makeSeg(): SegmentWritable {
  return { x1: 0, y1: 0, x2: 0, y2: 0 };
}
