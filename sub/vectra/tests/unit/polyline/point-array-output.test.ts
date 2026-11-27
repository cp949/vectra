/** polyline의 목록 변환과 경계 조건을 검증한다. */
import { describe, expect, test } from 'vitest';
import { reversePointsInto } from '../../../src/polyline/reverse-points-into';
import { transformPointsInto } from '../../../src/polyline/transform-points-into';
import { translatePointsInto } from '../../../src/polyline/translate-points-into';
import type { Matrix, Polyline, PointWritable } from '../../../src/types/flat-shapes.internal';

const EMPTY: Polyline = [];
const TWO_PT: Polyline = [
  { x: 1, y: 2 },
  { x: 3, y: 4 },
];
const THREE_PT: Polyline = [
  { x: 0, y: 0 },
  { x: 3, y: 4 },
  { x: 6, y: 8 },
];

const identity: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };

// ─────────────────────────────────────────────────────────────────────────────
// translatePointsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline point array output - translatePointsInto', () => {
  test('빈 polyline이면 clear된 빈 배열을 반환한다', () => {
    const out: PointWritable[] = [];
    const result = translatePointsInto(out, EMPTY, { x: 1, y: 2 });
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('기존 out contents가 clear된다', () => {
    const out: PointWritable[] = [
      { x: 99, y: 99 },
      { x: 88, y: 88 },
      { x: 77, y: 77 },
    ];
    translatePointsInto(out, TWO_PT, { x: 0, y: 0 });
    // TWO_PT는 2점이므로 clear 후 2개만 남아야 한다
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 1, y: 2 });
    expect(out[1]).toEqual({ x: 3, y: 4 });
  });

  test('object input이 새 object point로 출력된다', () => {
    const out: PointWritable[] = [];
    translatePointsInto(out, TWO_PT, { x: 10, y: 20 });
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 11, y: 22 });
    expect(out[1]).toEqual({ x: 13, y: 24 });
  });

  test('return identity가 outPoints 자체다', () => {
    const out: PointWritable[] = [];
    const result = translatePointsInto(out, TWO_PT, { x: 0, y: 0 });
    expect(result).toBe(out);
  });

  test('input/output 배열 aliasing에서도 결과가 유지된다', () => {
    const sharedPoints: PointWritable[] = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ];
    const poly: Polyline = sharedPoints;
    translatePointsInto(sharedPoints, poly, { x: 10, y: 10 });
    expect(sharedPoints).toHaveLength(2);
    expect(sharedPoints[0]).toEqual({ x: 11, y: 12 });
    expect(sharedPoints[1]).toEqual({ x: 13, y: 14 });
  });

  test('출력된 point object는 input point object와 다른 새 object다', () => {
    const pt = { x: 1, y: 2 };
    const poly: Polyline = [pt];
    const out: PointWritable[] = [];
    translatePointsInto(out, poly, { x: 0, y: 0 });
    expect(out[0]).not.toBe(pt);
  });

  test('3점 polyline을 translate한다', () => {
    const out: PointWritable[] = [];
    translatePointsInto(out, THREE_PT, { x: 1, y: -1 });
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ x: 1, y: -1 });
    expect(out[1]).toEqual({ x: 4, y: 3 });
    expect(out[2]).toEqual({ x: 7, y: 7 });
  });

  test('점 배열 자체를 translate한다', () => {
    const out: PointWritable[] = [];
    translatePointsInto(
      out,
      [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ],
      { x: 10, y: 20 }
    );
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 11, y: 22 });
    expect(out[1]).toEqual({ x: 13, y: 24 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// transformPointsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline point array output - transformPointsInto', () => {
  test('빈 polyline이면 clear된 빈 배열을 반환한다', () => {
    const out: PointWritable[] = [];
    const result = transformPointsInto(out, EMPTY, identity);
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('기존 out contents가 clear된다', () => {
    const out: PointWritable[] = [
      { x: 99, y: 99 },
      { x: 88, y: 88 },
    ];
    transformPointsInto(out, EMPTY, identity);
    expect(out).toHaveLength(0);
  });

  test('identity matrix로 변환하면 좌표가 그대로 출력된다', () => {
    const out: PointWritable[] = [];
    transformPointsInto(out, TWO_PT, identity);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 1, y: 2 });
    expect(out[1]).toEqual({ x: 3, y: 4 });
  });

  test('translation component만 있는 matrix로 변환한다', () => {
    const m: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    const out: PointWritable[] = [];
    transformPointsInto(out, TWO_PT, m);
    expect(out[0]).toEqual({ x: 11, y: 22 });
    expect(out[1]).toEqual({ x: 13, y: 24 });
  });

  test('scale matrix로 변환한다', () => {
    // (1,2) → (2*1 + 0*2, 0*1 + 3*2) = (2, 6)
    // (3,4) → (2*3 + 0*4, 0*3 + 3*4) = (6, 12)
    const m: Matrix = { a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 };
    const out: PointWritable[] = [];
    transformPointsInto(out, TWO_PT, m);
    expect(out[0]).toEqual({ x: 2, y: 6 });
    expect(out[1]).toEqual({ x: 6, y: 12 });
  });

  test("matrix transform formula: x' = a*x + c*y + tx, y' = b*x + d*y + ty", () => {
    // x' = 2*2 + 4*3 + 6 = 22, y' = 3*2 + 5*3 + 7 = 28
    const m: Matrix = { a: 2, b: 3, c: 4, d: 5, tx: 6, ty: 7 };
    const poly: Polyline = [{ x: 2, y: 3 }];
    const out: PointWritable[] = [];
    transformPointsInto(out, poly, m);
    expect(out[0].x).toBeCloseTo(22, 10);
    expect(out[0].y).toBeCloseTo(28, 10);
  });

  test('rotation matrix로 변환한다', () => {
    // R(π/2): a=cos, b=sin, c=-sin, d=cos
    // (1,0) → (0, 1)
    const cos = Math.cos(Math.PI / 2);
    const sin = Math.sin(Math.PI / 2);
    const m: Matrix = { a: cos, b: sin, c: -sin, d: cos, tx: 0, ty: 0 };
    const poly: Polyline = [{ x: 1, y: 0 }];
    const out: PointWritable[] = [];
    transformPointsInto(out, poly, m);
    expect(out[0].x).toBeCloseTo(0, 10);
    expect(out[0].y).toBeCloseTo(1, 10);
  });

  test('return identity가 outPoints 자체다', () => {
    const out: PointWritable[] = [];
    const result = transformPointsInto(out, TWO_PT, identity);
    expect(result).toBe(out);
  });

  test('input/output 배열 aliasing에서도 결과가 유지된다', () => {
    const sharedPoints: PointWritable[] = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ];
    const poly: Polyline = sharedPoints;
    const m: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    transformPointsInto(sharedPoints, poly, m);
    expect(sharedPoints).toHaveLength(2);
    expect(sharedPoints[0]).toEqual({ x: 11, y: 22 });
    expect(sharedPoints[1]).toEqual({ x: 13, y: 24 });
  });

  test('점 배열 자체를 transform한다', () => {
    const m: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    const out: PointWritable[] = [];
    transformPointsInto(
      out,
      [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ],
      m
    );
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 11, y: 22 });
    expect(out[1]).toEqual({ x: 13, y: 24 });
  });

  test('출력된 point object는 input point object와 다른 새 object다', () => {
    const pt = { x: 1, y: 2 };
    const poly: Polyline = [pt];
    const out: PointWritable[] = [];
    transformPointsInto(out, poly, identity);
    expect(out[0]).not.toBe(pt);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// reversePointsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline point array output - reversePointsInto', () => {
  test('빈 polyline이면 clear된 빈 배열을 반환한다', () => {
    const out: PointWritable[] = [];
    const result = reversePointsInto(out, EMPTY);
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('기존 out contents가 clear된다', () => {
    const out: PointWritable[] = [
      { x: 99, y: 99 },
      { x: 88, y: 88 },
    ];
    reversePointsInto(out, EMPTY);
    expect(out).toHaveLength(0);
  });

  test('2점 polyline의 순서를 뒤집는다', () => {
    const out: PointWritable[] = [];
    reversePointsInto(out, TWO_PT);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 3, y: 4 });
    expect(out[1]).toEqual({ x: 1, y: 2 });
  });

  test('3점 polyline의 순서를 뒤집는다', () => {
    const out: PointWritable[] = [];
    reversePointsInto(out, THREE_PT);
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ x: 6, y: 8 });
    expect(out[1]).toEqual({ x: 3, y: 4 });
    expect(out[2]).toEqual({ x: 0, y: 0 });
  });

  test('단일 point polyline은 그대로 반환된다', () => {
    const poly: Polyline = [{ x: 5, y: 7 }];
    const out: PointWritable[] = [];
    reversePointsInto(out, poly);
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ x: 5, y: 7 });
  });

  test('각 point 좌표는 변경 없이 복사된다', () => {
    const out: PointWritable[] = [];
    reversePointsInto(out, THREE_PT);
    expect(out[0]).toEqual({ x: 6, y: 8 });
    expect(out[1]).toEqual({ x: 3, y: 4 });
    expect(out[2]).toEqual({ x: 0, y: 0 });
  });

  test('return identity가 outPoints 자체다', () => {
    const out: PointWritable[] = [];
    const result = reversePointsInto(out, TWO_PT);
    expect(result).toBe(out);
  });

  test('input/output 배열 aliasing에서도 결과가 유지된다', () => {
    const sharedPoints: PointWritable[] = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 6 },
    ];
    const poly: Polyline = sharedPoints;
    reversePointsInto(sharedPoints, poly);
    expect(sharedPoints).toHaveLength(3);
    expect(sharedPoints[0]).toEqual({ x: 5, y: 6 });
    expect(sharedPoints[1]).toEqual({ x: 3, y: 4 });
    expect(sharedPoints[2]).toEqual({ x: 1, y: 2 });
  });

  test('출력된 point object는 input point object와 다른 새 object다', () => {
    const pt = { x: 1, y: 2 };
    const poly: Polyline = [pt];
    const out: PointWritable[] = [];
    reversePointsInto(out, poly);
    expect(out[0]).not.toBe(pt);
  });

  test('점 배열 자체를 reverse한다', () => {
    const out: PointWritable[] = [];
    reversePointsInto(out, [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 3, y: 4 });
    expect(out[1]).toEqual({ x: 1, y: 2 });
  });
});
