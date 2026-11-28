/**
 * polygon translatePointsInto, transformPointsInto, reversePointsInto의 좌표 배열 출력을 확인하는 테스트.
 * 같은 배열을 입력과 출력으로 쓰는 경우를 함께 다룬다.
 */
import type { Matrix, Polygon } from '../../../src/types/flat-shapes.internal';
import { describe, expect, test } from 'vitest';
import { reversePointsInto } from '../../../src/polygon/reverse-points-into';
import { transformPointsInto } from '../../../src/polygon/transform-points-into';
import { translatePointsInto } from '../../../src/polygon/translate-points-into';

const EMPTY: Polygon = [];
const TWO_PT: Polygon = [1, 2, 3, 4];
const THREE_PT: Polygon = [0, 0, 3, 4, 6, 8];

const identity: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };

// ─────────────────────────────────────────────────────────────────────────────
// translatePointsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon point array output - translatePointsInto', () => {
  test('빈 polygon이면 clear된 빈 배열을 반환한다', () => {
    const out: number[] = [];
    const result = translatePointsInto(out, EMPTY, { x: 1, y: 2 });
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('기존 out contents가 clear된다', () => {
    const out: number[] = [99, 99, 88, 88, 77, 77];
    translatePointsInto(out, TWO_PT, { x: 0, y: 0 });
    expect(out).toHaveLength(4);
    expect(out.slice(0, 2)).toEqual([1, 2]);
    expect(out.slice(2, 4)).toEqual([3, 4]);
  });

  test('입력의 각 좌표 쌍에 offset을 더한다', () => {
    const out: number[] = [];
    translatePointsInto(out, TWO_PT, { x: 10, y: 20 });
    expect(out).toHaveLength(4);
    expect(out.slice(0, 2)).toEqual([11, 22]);
    expect(out.slice(2, 4)).toEqual([13, 24]);
  });

  test('return identity가 outPoints 자체다', () => {
    const out: number[] = [];
    const result = translatePointsInto(out, TWO_PT, { x: 0, y: 0 });
    expect(result).toBe(out);
  });

  test('input/output 배열 aliasing에서도 결과가 유지된다', () => {
    const sharedPoints: number[] = [1, 2, 3, 4];
    const poly: Polygon = sharedPoints;
    translatePointsInto(sharedPoints, poly, { x: 10, y: 10 });
    expect(sharedPoints).toHaveLength(4);
    expect(sharedPoints.slice(0, 2)).toEqual([11, 12]);
    expect(sharedPoints.slice(2, 4)).toEqual([13, 14]);
  });

  test('3점 polygon을 translate한다', () => {
    const out: number[] = [];
    translatePointsInto(out, THREE_PT, { x: 1, y: -1 });
    expect(out).toHaveLength(6);
    expect(out.slice(0, 2)).toEqual([1, -1]);
    expect(out.slice(2, 4)).toEqual([4, 3]);
    expect(out.slice(4, 6)).toEqual([7, 7]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// transformPointsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon point array output - transformPointsInto', () => {
  test('빈 polygon이면 clear된 빈 배열을 반환한다', () => {
    const out: number[] = [];
    const result = transformPointsInto(out, EMPTY, identity);
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('기존 out contents가 clear된다', () => {
    const out: number[] = [99, 99, 88, 88];
    transformPointsInto(out, EMPTY, identity);
    expect(out).toHaveLength(0);
  });

  test('identity matrix로 변환하면 좌표가 그대로 출력된다', () => {
    const out: number[] = [];
    transformPointsInto(out, TWO_PT, identity);
    expect(out).toHaveLength(4);
    expect(out.slice(0, 2)).toEqual([1, 2]);
    expect(out.slice(2, 4)).toEqual([3, 4]);
  });

  test('translation component만 있는 matrix로 변환한다', () => {
    const m: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    const out: number[] = [];
    transformPointsInto(out, TWO_PT, m);
    expect(out.slice(0, 2)).toEqual([11, 22]);
    expect(out.slice(2, 4)).toEqual([13, 24]);
  });

  test('scale matrix로 변환한다', () => {
    const m: Matrix = { a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 };
    const out: number[] = [];
    transformPointsInto(out, TWO_PT, m);
    expect(out.slice(0, 2)).toEqual([2, 6]);
    expect(out.slice(2, 4)).toEqual([6, 12]);
  });

  test("matrix transform formula: x' = a*x + c*y + tx, y' = b*x + d*y + ty", () => {
    // x' = 2*2 + 4*3 + 6 = 22, y' = 3*2 + 5*3 + 7 = 28
    const m: Matrix = { a: 2, b: 3, c: 4, d: 5, tx: 6, ty: 7 };
    const poly: Polygon = [2, 3];
    const out: number[] = [];
    transformPointsInto(out, poly, m);
    expect(out[0]).toBeCloseTo(22, 10);
    expect(out[1]).toBeCloseTo(28, 10);
  });

  test('rotation matrix로 변환한다', () => {
    // R(π/2): (1,0) → (0, 1)
    const cos = Math.cos(Math.PI / 2);
    const sin = Math.sin(Math.PI / 2);
    const m: Matrix = { a: cos, b: sin, c: -sin, d: cos, tx: 0, ty: 0 };
    const poly: Polygon = [1, 0];
    const out: number[] = [];
    transformPointsInto(out, poly, m);
    expect(out[0]).toBeCloseTo(0, 10);
    expect(out[1]).toBeCloseTo(1, 10);
  });

  test('return identity가 outPoints 자체다', () => {
    const out: number[] = [];
    const result = transformPointsInto(out, TWO_PT, identity);
    expect(result).toBe(out);
  });

  test('input/output 배열 aliasing에서도 결과가 유지된다', () => {
    const sharedPoints: number[] = [1, 2, 3, 4];
    const poly: Polygon = sharedPoints;
    const m: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    transformPointsInto(sharedPoints, poly, m);
    expect(sharedPoints).toHaveLength(4);
    expect(sharedPoints.slice(0, 2)).toEqual([11, 22]);
    expect(sharedPoints.slice(2, 4)).toEqual([13, 24]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// reversePointsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon point array output - reversePointsInto', () => {
  test('빈 polygon이면 clear된 빈 배열을 반환한다', () => {
    const out: number[] = [];
    const result = reversePointsInto(out, EMPTY);
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('기존 out contents가 clear된다', () => {
    const out: number[] = [99, 99, 88, 88];
    reversePointsInto(out, EMPTY);
    expect(out).toHaveLength(0);
  });

  test('2점 polygon의 순서를 뒤집는다', () => {
    const out: number[] = [];
    reversePointsInto(out, TWO_PT);
    expect(out).toHaveLength(4);
    expect(out.slice(0, 2)).toEqual([3, 4]);
    expect(out.slice(2, 4)).toEqual([1, 2]);
  });

  test('3점 polygon의 순서를 뒤집는다', () => {
    const out: number[] = [];
    reversePointsInto(out, THREE_PT);
    expect(out).toHaveLength(6);
    expect(out.slice(0, 2)).toEqual([6, 8]);
    expect(out.slice(2, 4)).toEqual([3, 4]);
    expect(out.slice(4, 6)).toEqual([0, 0]);
  });

  test('단일 point polygon은 그대로 반환된다', () => {
    const poly: Polygon = [5, 7];
    const out: number[] = [];
    reversePointsInto(out, poly);
    expect(out).toHaveLength(2);
    expect(out.slice(0, 2)).toEqual([5, 7]);
  });

  test('return identity가 outPoints 자체다', () => {
    const out: number[] = [];
    const result = reversePointsInto(out, TWO_PT);
    expect(result).toBe(out);
  });

  test('input/output 배열 aliasing에서도 결과가 유지된다', () => {
    const sharedPoints: number[] = [1, 2, 3, 4, 5, 6];
    const poly: Polygon = sharedPoints;
    reversePointsInto(sharedPoints, poly);
    expect(sharedPoints).toHaveLength(6);
    expect(sharedPoints.slice(0, 2)).toEqual([5, 6]);
    expect(sharedPoints.slice(2, 4)).toEqual([3, 4]);
    expect(sharedPoints.slice(4, 6)).toEqual([1, 2]);
  });
});
