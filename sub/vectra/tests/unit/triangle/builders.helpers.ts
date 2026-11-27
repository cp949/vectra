/** 삼각형 생성 시험에 쓰는 좌표 비교와 초기값. */

import { expect } from 'vitest';
import type { Point, TriangleWritable } from '../../../src/types/flat-shapes.internal';

export type TrianglePoints = TriangleWritable;

export const SQRT3 = Math.sqrt(3);
export const SENTINEL: TrianglePoints = { x1: 1, y1: 1, x2: 2, y2: 2, x3: 3, y3: 3 };

/** 점 좌표를 부동소수점 허용 오차 내에서 비교한다. */
export function expectXY(actual: Point, x: number, y: number): void {
  expect(actual.x).toBeCloseTo(x, 12);
  expect(actual.y).toBeCloseTo(y, 12);
}

/** 꼭짓점 세 개의 좌표를 각각 비교한다. */
export function expectTriangle(actual: TrianglePoints, expected: TrianglePoints): void {
  for (const field of ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'] as const) {
    expect(actual[field]).toBeCloseTo(expected[field], 12);
  }
}

/** 실패 시 출력 보존을 확인하도록 알려진 좌표를 기록한다. */
export function setTriangle(out: TrianglePoints, value: TrianglePoints = SENTINEL): void {
  Object.assign(out, value);
}
