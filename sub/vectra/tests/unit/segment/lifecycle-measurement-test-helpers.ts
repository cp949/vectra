/** 중첩 끝점과 점 출력의 생성 및 검증을 돕는다. */
import { expect } from 'vitest';
import type { SegmentWritable, XYWritable } from '../../../src/types';

type Point = { x: number; y: number };

/** 점 출력을 원점으로 초기화한다. */
export const xyOut = (): XYWritable => ({ x: 0, y: 0 });
/** 중첩 끝점을 원점으로 초기화한다. */
export const segmentOut = (): SegmentWritable => ({ a: { x: 0, y: 0 }, b: { x: 0, y: 0 } });

/** 점의 두 좌표를 정확히 비교한다. */
export const expectXY = (actual: XYWritable, expected: Point) => {
  if (Array.isArray(actual)) {
    expect(actual).toEqual([expected.x, expected.y]);
    return;
  }

  expect(actual).toEqual(expected);
};

/** 점의 두 좌표를 소수점 아래 열 자리 정밀도로 비교한다. */
export const expectCloseXY = (actual: XYWritable, expected: Point) => {
  if (Array.isArray(actual)) {
    expect(actual[0]).toBeCloseTo(expected.x, 10);
    expect(actual[1]).toBeCloseTo(expected.y, 10);
    return;
  }

  expect(actual.x).toBeCloseTo(expected.x, 10);
  expect(actual.y).toBeCloseTo(expected.y, 10);
};

/** 선분의 두 끝점을 순서대로 비교한다. */
export const expectSegment = (actual: SegmentWritable, a: Point, b: Point) => {
  expectXY(actual.a, a);
  expectXY(actual.b, b);
};
