/**
 * polygon 조회와 거리 테스트가 함께 쓰는 fixture와 출력 seed를 모은다.
 */
import type { Polygon, SegmentWritable, PointWritable } from '../../../src/types/flat-shapes.internal';

export const EMPTY: Polygon = [];
export const SINGLE: Polygon = [5, 7];
export const TWO_PT: Polygon = [0, 0, 3, 4];

// 수학적 y-up 좌표계 기준 counter-clockwise 3-4-5 삼각형 -> signedArea > 0.
export const CCW_TRI: Polygon = [0, 0, 4, 0, 0, 3];

export const UNIT_SQUARE: Polygon = [0, 0, 1, 0, 1, 1, 0, 1];

export const REPEATED_PT: Polygon = [0, 0, 0, 0, 1, 0];

/**
 * point Into 함수에 넘길 0 좌표 seed를 만든다.
 * 테스트마다 새 객체를 써서 이전 기록이 섞이지 않게 한다.
 */
export function makePoint(): PointWritable {
  return { x: 0, y: 0 };
}

/**
 * edgeAtInto에 넘길 0 좌표 segment seed를 만든다.
 * 테스트마다 새 객체를 써서 이전 기록이 섞이지 않게 한다.
 */
export function makeSeg(): SegmentWritable {
  return { x1: 0, y1: 0, x2: 0, y2: 0 };
}
