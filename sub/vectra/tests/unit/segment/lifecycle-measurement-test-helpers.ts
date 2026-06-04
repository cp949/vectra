import { expect } from 'vitest';
import type { BoundsWritable, SegmentWritable, XYWritable } from '../../../src/types';

type Point = { x: number; y: number };

export const xyOut = (): XYWritable => ({ x: 0, y: 0 });
export const segmentOut = (): SegmentWritable => ({ a: { x: 0, y: 0 }, b: { x: 0, y: 0 } });
export const boundsOut = (): BoundsWritable => ({ min: { x: 0, y: 0 }, max: { x: 0, y: 0 } });

export const expectXY = (actual: XYWritable, expected: Point) => {
  if (Array.isArray(actual)) {
    expect(actual).toEqual([expected.x, expected.y]);
    return;
  }

  expect(actual).toEqual(expected);
};

export const expectCloseXY = (actual: XYWritable, expected: Point) => {
  if (Array.isArray(actual)) {
    expect(actual[0]).toBeCloseTo(expected.x, 10);
    expect(actual[1]).toBeCloseTo(expected.y, 10);
    return;
  }

  expect(actual.x).toBeCloseTo(expected.x, 10);
  expect(actual.y).toBeCloseTo(expected.y, 10);
};

export const expectSegment = (actual: SegmentWritable, a: Point, b: Point) => {
  expectXY(actual.a, a);
  expectXY(actual.b, b);
};
