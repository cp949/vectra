/**
 * structural shape conversion polygon builder unit test.
 *
 * fromBounds* / fromRect* / fromTriangle*의 고정 개수 vertex 산식,
 * repair-없음 정책, non-finite pass-through, pre-populated clear, companion freshness를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { fromBounds } from '../../../src/polygon/from-bounds';
import { fromBoundsInto } from '../../../src/polygon/from-bounds-into';
import { fromRect } from '../../../src/polygon/from-rect';
import { fromRectInto } from '../../../src/polygon/from-rect-into';
import { fromTriangle } from '../../../src/polygon/from-triangle';
import { fromTriangleInto } from '../../../src/polygon/from-triangle-into';
import type { XYObjectWritable } from '../../../src/types/index';

// ──────────────────────────────────────────────
// fromBoundsInto
// ──────────────────────────────────────────────
describe('fromBoundsInto', () => {
  test('object bounds에서 vertex 4개를 시계 방향(min → maxX,minY → max → minX,maxY)으로 push한다', () => {
    const out: number[] = [];
    const result = fromBoundsInto(out, { minX: 1, minY: 2, maxX: 5, maxY: 8 });
    expect(result).toBe(out);
    expect(out).toHaveLength(8);
    expect(out.slice(0, 2)).toEqual([1, 2]);
    expect(out.slice(2, 4)).toEqual([5, 2]);
    expect(out.slice(4, 6)).toEqual([5, 8]);
    expect(out.slice(6, 8)).toEqual([1, 8]);
  });

  test('min > max 역전 bounds도 repair하지 않고 산식 결과를 그대로 기록한다', () => {
    const out: number[] = [];
    fromBoundsInto(out, { minX: 2, minY: 3, maxX: 1, maxY: 0 });
    expect(out).toEqual([2, 3, 1, 3, 1, 0, 2, 0]);
  });

  test('NaN corner를 NaN 좌표로 pass-through한다', () => {
    const out: number[] = [];
    fromBoundsInto(out, { minX: Number.NaN, minY: 0, maxX: 1, maxY: 1 });
    expect(out).toHaveLength(8);
    expect(Number.isNaN(out[0])).toBe(true);
    expect(Number.isNaN(out[6])).toBe(true);
    expect(out[2]).toBe(1);
  });

  test('+Infinity / -Infinity corner를 그대로 pass-through한다', () => {
    const out: number[] = [];
    fromBoundsInto(out, { minX: Number.NEGATIVE_INFINITY, minY: 0, maxX: 1, maxY: Number.POSITIVE_INFINITY });
    expect(out).toHaveLength(8);
    expect(out[0]).toBe(Number.NEGATIVE_INFINITY);
    expect(out[5]).toBe(Number.POSITIVE_INFINITY);
  });

  test('pre-populated out도 clear 후 정확히 4개 element만 남긴다', () => {
    const out: number[] = [9, 9, 8, 8, 7, 7, 6, 6, 5, 5];
    fromBoundsInto(out, { minX: 0, minY: 0, maxX: 1, maxY: 1 });
    expect(out).toHaveLength(8);
    expect(out.slice(0, 2)).toEqual([0, 0]);
  });
});

// ──────────────────────────────────────────────
// fromBounds (companion)
// ──────────────────────────────────────────────
describe('fromBounds', () => {
  test('fromBoundsInto 결과와 같은 좌표 배열을 반환한다', () => {
    const expected: number[] = [];
    fromBoundsInto(expected, { minX: -1, minY: -2, maxX: 3, maxY: 4 });
    const actual = fromBounds({ minX: -1, minY: -2, maxX: 3, maxY: 4 });
    expect(actual).toEqual(expected);
  });

  test('매 호출마다 새 좌표 배열을 만든다', () => {
    const bounds = { minX: 0, minY: 0, maxX: 1, maxY: 1 };
    const r1 = fromBounds(bounds);
    const r2 = fromBounds(bounds);
    expect(r1).not.toBe(r2);
  });
});

// ──────────────────────────────────────────────
// fromRectInto
// ──────────────────────────────────────────────
describe('fromRectInto', () => {
  test('object rect에서 vertex 4개를 시계 방향(x,y → x+w,y → x+w,y+h → x,y+h)으로 push한다', () => {
    const out: number[] = [];
    const result = fromRectInto(out, { x: 1, y: 2, width: 4, height: 6 });
    expect(result).toBe(out);
    expect(out).toEqual([1, 2, 5, 2, 5, 8, 1, 8]);
  });

  test('negative width를 repair하지 않고 좌표가 wrap된 결과 그대로 기록한다', () => {
    const out: number[] = [];
    fromRectInto(out, { x: 10, y: 0, width: -4, height: 3 });
    expect(out).toEqual([10, 0, 6, 0, 6, 3, 10, 3]);
  });

  test('negative height를 repair하지 않고 좌표가 wrap된 결과 그대로 기록한다', () => {
    const out: number[] = [];
    fromRectInto(out, { x: 0, y: 10, width: 4, height: -3 });
    expect(out).toEqual([0, 10, 4, 10, 4, 7, 0, 7]);
  });

  test('NaN component를 NaN 좌표로 pass-through한다', () => {
    const out: number[] = [];
    fromRectInto(out, { x: 0, y: 0, width: Number.NaN, height: 2 });
    expect(out).toHaveLength(8);
    expect(out.slice(0, 2)).toEqual([0, 0]);
    expect(Number.isNaN(out[2])).toBe(true);
    expect(Number.isNaN(out[4])).toBe(true);
    expect(out.slice(6, 8)).toEqual([0, 2]);
  });

  test('+Infinity / -Infinity component를 그대로 pass-through한다', () => {
    const out: number[] = [];
    fromRectInto(out, { x: 0, y: 0, width: Number.POSITIVE_INFINITY, height: Number.NEGATIVE_INFINITY });
    expect(out).toHaveLength(8);
    expect(out[2]).toBe(Number.POSITIVE_INFINITY);
    expect(out[5]).toBe(Number.NEGATIVE_INFINITY);
  });

  test('pre-populated out도 clear 후 정확히 4개 element만 남긴다', () => {
    const out: number[] = [9, 9, 8, 8, 7, 7, 6, 6, 5, 5];
    fromRectInto(out, { x: 0, y: 0, width: 1, height: 1 });
    expect(out).toHaveLength(8);
    expect(out.slice(0, 2)).toEqual([0, 0]);
  });
});

// ──────────────────────────────────────────────
// fromRect (companion)
// ──────────────────────────────────────────────
describe('fromRect', () => {
  test('fromRectInto 결과와 같은 좌표 배열을 반환한다', () => {
    const expected: number[] = [];
    fromRectInto(expected, { x: 2, y: -1, width: 3, height: 4 });
    const actual = fromRect({ x: 2, y: -1, width: 3, height: 4 });
    expect(actual).toEqual(expected);
  });

  test('매 호출마다 새 좌표 배열을 만든다', () => {
    const rect = { x: 0, y: 0, width: 1, height: 1 };
    const r1 = fromRect(rect);
    const r2 = fromRect(rect);
    expect(r1).not.toBe(r2);
  });
});

// ──────────────────────────────────────────────
// fromTriangleInto
// ──────────────────────────────────────────────
describe('fromTriangleInto', () => {
  test('object triangle에서 vertex 3개를 a → b → c 순서로 push한다', () => {
    const out: number[] = [];
    const result = fromTriangleInto(out, { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 3 });
    expect(result).toBe(out);
    expect(out).toEqual([0, 0, 4, 0, 0, 3]);
  });

  test('degenerate triangle(collinear, signedArea = 0)도 그대로 3개 vertex를 push한다', () => {
    const out: number[] = [];
    fromTriangleInto(out, { x1: 0, y1: 0, x2: 1, y2: 1, x3: 2, y3: 2 });
    expect(out).toEqual([0, 0, 1, 1, 2, 2]);
  });

  test('동일 vertex 중복 triangle도 그대로 3개 vertex를 push한다', () => {
    const out: number[] = [];
    fromTriangleInto(out, { x1: 3, y1: 3, x2: 3, y2: 3, x3: 3, y3: 3 });
    expect(out).toEqual([3, 3, 3, 3, 3, 3]);
  });

  test('NaN vertex를 NaN 좌표로 pass-through한다', () => {
    const out: number[] = [];
    fromTriangleInto(out, { x1: Number.NaN, y1: 0, x2: 1, y2: 0, x3: 0, y3: 1 });
    expect(out).toHaveLength(6);
    expect(Number.isNaN(out[0])).toBe(true);
    expect(out.slice(2, 4)).toEqual([1, 0]);
    expect(out.slice(4, 6)).toEqual([0, 1]);
  });

  test('+Infinity / -Infinity vertex를 그대로 pass-through한다', () => {
    const out: number[] = [];
    fromTriangleInto(out, { x1: Number.POSITIVE_INFINITY, y1: 0, x2: 0, y2: Number.NEGATIVE_INFINITY, x3: 1, y3: 1 });
    expect(out).toHaveLength(6);
    expect(out[0]).toBe(Number.POSITIVE_INFINITY);
    expect(out[3]).toBe(Number.NEGATIVE_INFINITY);
  });

  test('pre-populated out도 clear 후 정확히 3개 element만 남긴다', () => {
    const out: number[] = [9, 9, 8, 8, 7, 7, 6, 6];
    fromTriangleInto(out, { x1: 0, y1: 0, x2: 1, y2: 0, x3: 0, y3: 1 });
    expect(out).toHaveLength(6);
    expect(out.slice(0, 2)).toEqual([0, 0]);
  });
});

// ──────────────────────────────────────────────
// fromTriangle (companion)
// ──────────────────────────────────────────────
describe('fromTriangle', () => {
  test('fromTriangleInto 결과와 같은 좌표 배열을 반환한다', () => {
    const expected: number[] = [];
    fromTriangleInto(expected, { x1: 0, y1: 0, x2: 2, y2: 0, x3: 1, y3: 2 });
    const actual = fromTriangle({ x1: 0, y1: 0, x2: 2, y2: 0, x3: 1, y3: 2 });
    expect(actual).toEqual(expected);
  });

  test('매 호출마다 새 좌표 배열을 만든다', () => {
    const triangle = { x1: 0, y1: 0, x2: 1, y2: 0, x3: 0, y3: 1 };
    const r1 = fromTriangle(triangle);
    const r2 = fromTriangle(triangle);
    expect(r1).not.toBe(r2);
  });
});
