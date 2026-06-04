import { expect } from 'vitest';

export type XY = { x: number; y: number };
export type TrianglePoints = { a: XY; b: XY; c: XY };

export const SQRT3 = Math.sqrt(3);
export const SENTINEL: TrianglePoints = {
  a: { x: 1, y: 1 },
  b: { x: 2, y: 2 },
  c: { x: 3, y: 3 },
};

export function expectXY(actual: XY, x: number, y: number): void {
  expect(actual.x).toBeCloseTo(x, 12);
  expect(actual.y).toBeCloseTo(y, 12);
}

export function expectTriangle(actual: TrianglePoints, expected: TrianglePoints): void {
  expectXY(actual.a, expected.a.x, expected.a.y);
  expectXY(actual.b, expected.b.x, expected.b.y);
  expectXY(actual.c, expected.c.x, expected.c.y);
}

export function setTriangle(out: TrianglePoints, value: TrianglePoints = SENTINEL): void {
  out.a = { ...value.a };
  out.b = { ...value.b };
  out.c = { ...value.c };
}
