/** Polygon의 평평한 입출력 계약을 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import { boundsInto } from '../../../src/polygon/bounds-into';
import { boundingCircleInto } from '../../../src/polygon/bounding-circle-into';
import { fromRectInto } from '../../../src/polygon/from-rect-into';
import { reversePointsInto } from '../../../src/polygon/reverse-points-into';
import { fromBoundsInto } from '../../../src/polygon/from-bounds-into';
import { fromTriangleInto } from '../../../src/polygon/from-triangle-into';
import { fromCircleApproximationInto } from '../../../src/polygon/from-circle-approximation-into';
import { fromEllipseApproximationInto } from '../../../src/polygon/from-ellipse-approximation-into';
import { regularPolygonInto } from '../../../src/polygon/regular-polygon-into';
import { starPolygonInto } from '../../../src/polygon/star-polygon-into';
import { sortPointsByAngleInto } from '../../../src/polygon/sort-points-by-angle-into';
import { transformPointsInto } from '../../../src/polygon/transform-points-into';
import { translatePointsInto } from '../../../src/polygon/translate-points-into';
import { toNumberArrayInto } from '../../../src/polygon/to-number-array-into';
import { toPolylineInto } from '../../../src/polygon/to-polyline-into';
import { pointsAlongEdgesInto } from '../../../src/polygon/points-along-edges-into';
import type { PointWritable, Polygon } from '../../../src/types/flat-shapes.internal';

/** 외부 경계 객체를 흉내 낸다. */
class ExternalBounds {
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;
  tag = 'bounds';
}

/** 외부 원 객체를 흉내 낸다. */
class ExternalCircle {
  cx = 0;
  cy = 0;
  r = 0;
  tag = 'circle';
}

test('boundsInto는 외부 경계 객체의 참조와 타입을 보존한다', () => {
  const polygon: Polygon = [0, 0, 2, 0, 0, 2];
  const out = new ExternalBounds();
  const result = boundsInto(out, polygon);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalBounds>();
});

test('boundingCircleInto는 외부 원 객체의 참조와 타입을 보존한다', () => {
  const out = new ExternalCircle();
  const result = boundingCircleInto(out, [0, 0, 2, 0, 0, 2]);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalCircle>();
});

test('fromRectInto는 좌표를 순서대로 기록하고 같은 배열을 반환한다', () => {
  const out: number[] = [];
  const result = fromRectInto(out, { x: 1, y: 2, width: 3, height: 4 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<number[]>();
  expect(out).toEqual([1, 2, 4, 2, 4, 6, 1, 6]);
});

test('reversePointsInto는 같은 배열에서 좌표 짝을 보존하며 순서를 뒤집는다', () => {
  const out = [1, 2, 3, 4, 5, 6];
  const result = reversePointsInto(out, out);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<number[]>();
  expect(out).toEqual([5, 6, 3, 4, 1, 2]);
});

test.each([
  ['fromBoundsInto', (out: number[]) => fromBoundsInto(out, { minX: 0, minY: 0, maxX: 2, maxY: 2 })],
  ['fromTriangleInto', (out: number[]) => fromTriangleInto(out, { x1: 0, y1: 0, x2: 2, y2: 0, x3: 0, y3: 2 })],
  ['fromCircleApproximationInto', (out: number[]) => fromCircleApproximationInto(out, { x: 0, y: 0 }, 2, 3)],
  ['fromEllipseApproximationInto', (out: number[]) => fromEllipseApproximationInto(out, { x: 0, y: 0 }, 2, 1, 3)],
  ['regularPolygonInto', (out: number[]) => regularPolygonInto(out, { x: 0, y: 0 }, 2, 3)],
  ['starPolygonInto', (out: number[]) => starPolygonInto(out, { x: 0, y: 0 }, 1, 2, 3)],
  ['sortPointsByAngleInto', (out: number[]) => sortPointsByAngleInto(out, [2, 0, 0, 0, 0, 2])],
  [
    'transformPointsInto',
    (out: number[]) => transformPointsInto(out, [2, 0], { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }),
  ],
  ['translatePointsInto', (out: number[]) => translatePointsInto(out, [2, 0], { x: 1, y: 2 })],
  ['toNumberArrayInto', (out: number[]) => toNumberArrayInto(out, [2, 0])],
] as const)('%s는 좌표 출력 배열의 참조와 원소 타입을 보존한다', (_, write) => {
  const out: number[] = [];
  const result = write(out);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<number[]>();
});

test.each([
  ['toPolylineInto', (out: PointWritable[]) => toPolylineInto(out, [2, 0])],
  ['pointsAlongEdgesInto', (out: PointWritable[]) => pointsAlongEdgesInto(out, [2, 0], 1)],
] as const)('%s는 점 출력 배열의 참조와 원소 타입을 보존한다', (_, write) => {
  const out: PointWritable[] = [];
  const result = write(out);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('toPolylineInto는 특수 점 배열을 받아도 기본 점 배열을 반환한다', () => {
  const out: (PointWritable & { id: string })[] = [];
  const result = toPolylineInto(out, [2, 3]);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
  expect(result).toEqual([{ x: 2, y: 3 }]);
});
