import type { PolygonLike, SegmentWritable, XYObjectWritable } from '../../../src/types';

export const EMPTY: PolygonLike = { points: [] };
export const SINGLE: PolygonLike = { points: [{ x: 5, y: 7 }] };
export const TWO_PT: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 3, y: 4 },
  ],
};

// 수학적 y-up 좌표계 기준 counter-clockwise 3-4-5 삼각형 -> signedArea > 0.
export const CCW_TRI: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 0, y: 3 },
  ],
};

export const UNIT_SQUARE: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ],
};

export const REPEATED_PT: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
  ],
};

export function makePoint(): XYObjectWritable {
  return { x: 0, y: 0 };
}

export function makeSeg(): SegmentWritable<XYObjectWritable, XYObjectWritable> {
  return { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
}
