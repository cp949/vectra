/** 출력 점의 좌표를 정확히 또는 허용 오차를 두고 비교한다. */
import { expect } from 'vitest';
import type { Point } from '../../../src/types/flat-shapes.internal';

/** 점의 두 좌표를 정확히 비교한다. */
export const expectXY = (actual: Point, expected: Point) => {
  expect(actual).toEqual(expected);
};

/** 점의 두 좌표를 소수점 아래 열 자리 정밀도로 비교한다. */
export const expectCloseXY = (actual: Point, expected: Point) => {
  expect(actual.x).toBeCloseTo(expected.x, 10);
  expect(actual.y).toBeCloseTo(expected.y, 10);
};
