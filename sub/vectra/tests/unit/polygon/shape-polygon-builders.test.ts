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
    const out: XYObjectWritable[] = [];
    const result = fromBoundsInto(out, { min: { x: 1, y: 2 }, max: { x: 5, y: 8 } });
    expect(result).toBe(out);
    expect(out).toHaveLength(4);
    expect(out[0]).toEqual({ x: 1, y: 2 });
    expect(out[1]).toEqual({ x: 5, y: 2 });
    expect(out[2]).toEqual({ x: 5, y: 8 });
    expect(out[3]).toEqual({ x: 1, y: 8 });
  });

  test('tuple bounds([min, max])가 object bounds와 동일 결과를 만든다', () => {
    const fromObject: XYObjectWritable[] = [];
    const fromTuple: XYObjectWritable[] = [];
    fromBoundsInto(fromObject, { min: { x: -3, y: 4 }, max: { x: 7, y: 10 } });
    fromBoundsInto(fromTuple, [
      [-3, 4],
      [7, 10],
    ]);
    expect(fromTuple).toEqual(fromObject);
  });

  test('corner를 XYTuple과 XY object로 섞어 넣어도 동일 결과를 만든다', () => {
    const fromMixed: XYObjectWritable[] = [];
    const fromObject: XYObjectWritable[] = [];
    fromBoundsInto(fromMixed, [[0, 0], { x: 4, y: 6 }]);
    fromBoundsInto(fromObject, { min: { x: 0, y: 0 }, max: { x: 4, y: 6 } });
    expect(fromMixed).toEqual(fromObject);
  });

  test('min > max 역전 bounds도 repair하지 않고 산식 결과를 그대로 기록한다', () => {
    const out: XYObjectWritable[] = [];
    fromBoundsInto(out, { min: { x: 2, y: 3 }, max: { x: 1, y: 0 } });
    expect(out).toEqual([
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  test('NaN corner를 NaN 좌표로 pass-through한다', () => {
    const out: XYObjectWritable[] = [];
    fromBoundsInto(out, { min: { x: Number.NaN, y: 0 }, max: { x: 1, y: 1 } });
    expect(out).toHaveLength(4);
    expect(Number.isNaN(out[0].x)).toBe(true);
    expect(Number.isNaN(out[3].x)).toBe(true);
    expect(out[1].x).toBe(1);
  });

  test('+Infinity / -Infinity corner를 그대로 pass-through한다', () => {
    const out: XYObjectWritable[] = [];
    fromBoundsInto(out, {
      min: { x: Number.NEGATIVE_INFINITY, y: 0 },
      max: { x: 1, y: Number.POSITIVE_INFINITY },
    });
    expect(out).toHaveLength(4);
    expect(out[0].x).toBe(Number.NEGATIVE_INFINITY);
    expect(out[2].y).toBe(Number.POSITIVE_INFINITY);
  });

  test('pre-populated out도 clear 후 정확히 4개 element만 남긴다', () => {
    const out: XYObjectWritable[] = [
      { x: 9, y: 9 },
      { x: 8, y: 8 },
      { x: 7, y: 7 },
      { x: 6, y: 6 },
      { x: 5, y: 5 },
    ];
    fromBoundsInto(out, { min: { x: 0, y: 0 }, max: { x: 1, y: 1 } });
    expect(out).toHaveLength(4);
    expect(out[0]).toEqual({ x: 0, y: 0 });
  });
});

// ──────────────────────────────────────────────
// fromBounds (companion)
// ──────────────────────────────────────────────
describe('fromBounds', () => {
  test('fromBoundsInto 결과와 동등한 { points } 를 반환한다', () => {
    const expected: XYObjectWritable[] = [];
    fromBoundsInto(expected, { min: { x: -1, y: -2 }, max: { x: 3, y: 4 } });
    const actual = fromBounds({ min: { x: -1, y: -2 }, max: { x: 3, y: 4 } });
    expect(actual.points).toEqual(expected);
  });

  test('매 호출마다 새 { points } object와 새 plain { x, y } element를 만든다', () => {
    const bounds = { min: { x: 0, y: 0 }, max: { x: 1, y: 1 } };
    const r1 = fromBounds(bounds);
    const r2 = fromBounds(bounds);
    expect(r1).not.toBe(r2);
    expect(r1.points).not.toBe(r2.points);
    expect(r1.points[0]).not.toBe(r2.points[0]);
    expect(Object.getPrototypeOf(r1.points[0])).toBe(Object.prototype);
  });
});

// ──────────────────────────────────────────────
// fromRectInto
// ──────────────────────────────────────────────
describe('fromRectInto', () => {
  test('object rect에서 vertex 4개를 시계 방향(x,y → x+w,y → x+w,y+h → x,y+h)으로 push한다', () => {
    const out: XYObjectWritable[] = [];
    const result = fromRectInto(out, { x: 1, y: 2, width: 4, height: 6 });
    expect(result).toBe(out);
    expect(out).toEqual([
      { x: 1, y: 2 },
      { x: 5, y: 2 },
      { x: 5, y: 8 },
      { x: 1, y: 8 },
    ]);
  });

  test('tuple rect([x, y, w, h])가 object rect와 동일 결과를 만든다', () => {
    const fromObject: XYObjectWritable[] = [];
    const fromTuple: XYObjectWritable[] = [];
    fromRectInto(fromObject, { x: -2, y: 3, width: 5, height: 7 });
    fromRectInto(fromTuple, [-2, 3, 5, 7]);
    expect(fromTuple).toEqual(fromObject);
  });

  test('negative width를 repair하지 않고 좌표가 wrap된 결과 그대로 기록한다', () => {
    const out: XYObjectWritable[] = [];
    fromRectInto(out, { x: 10, y: 0, width: -4, height: 3 });
    expect(out).toEqual([
      { x: 10, y: 0 },
      { x: 6, y: 0 },
      { x: 6, y: 3 },
      { x: 10, y: 3 },
    ]);
  });

  test('negative height를 repair하지 않고 좌표가 wrap된 결과 그대로 기록한다', () => {
    const out: XYObjectWritable[] = [];
    fromRectInto(out, { x: 0, y: 10, width: 4, height: -3 });
    expect(out).toEqual([
      { x: 0, y: 10 },
      { x: 4, y: 10 },
      { x: 4, y: 7 },
      { x: 0, y: 7 },
    ]);
  });

  test('NaN component를 NaN 좌표로 pass-through한다', () => {
    const out: XYObjectWritable[] = [];
    fromRectInto(out, { x: 0, y: 0, width: Number.NaN, height: 2 });
    expect(out).toHaveLength(4);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(Number.isNaN(out[1].x)).toBe(true);
    expect(Number.isNaN(out[2].x)).toBe(true);
    expect(out[3]).toEqual({ x: 0, y: 2 });
  });

  test('+Infinity / -Infinity component를 그대로 pass-through한다', () => {
    const out: XYObjectWritable[] = [];
    fromRectInto(out, { x: 0, y: 0, width: Number.POSITIVE_INFINITY, height: Number.NEGATIVE_INFINITY });
    expect(out).toHaveLength(4);
    expect(out[1].x).toBe(Number.POSITIVE_INFINITY);
    expect(out[2].y).toBe(Number.NEGATIVE_INFINITY);
  });

  test('pre-populated out도 clear 후 정확히 4개 element만 남긴다', () => {
    const out: XYObjectWritable[] = [
      { x: 9, y: 9 },
      { x: 8, y: 8 },
      { x: 7, y: 7 },
      { x: 6, y: 6 },
      { x: 5, y: 5 },
    ];
    fromRectInto(out, { x: 0, y: 0, width: 1, height: 1 });
    expect(out).toHaveLength(4);
    expect(out[0]).toEqual({ x: 0, y: 0 });
  });
});

// ──────────────────────────────────────────────
// fromRect (companion)
// ──────────────────────────────────────────────
describe('fromRect', () => {
  test('fromRectInto 결과와 동등한 { points } 를 반환한다', () => {
    const expected: XYObjectWritable[] = [];
    fromRectInto(expected, { x: 2, y: -1, width: 3, height: 4 });
    const actual = fromRect({ x: 2, y: -1, width: 3, height: 4 });
    expect(actual.points).toEqual(expected);
  });

  test('매 호출마다 새 { points } object와 새 plain { x, y } element를 만든다', () => {
    const rect = { x: 0, y: 0, width: 1, height: 1 };
    const r1 = fromRect(rect);
    const r2 = fromRect(rect);
    expect(r1).not.toBe(r2);
    expect(r1.points).not.toBe(r2.points);
    expect(r1.points[0]).not.toBe(r2.points[0]);
    expect(Object.getPrototypeOf(r1.points[0])).toBe(Object.prototype);
  });
});

// ──────────────────────────────────────────────
// fromTriangleInto
// ──────────────────────────────────────────────
describe('fromTriangleInto', () => {
  test('object triangle에서 vertex 3개를 a → b → c 순서로 push한다', () => {
    const out: XYObjectWritable[] = [];
    const result = fromTriangleInto(out, {
      a: { x: 0, y: 0 },
      b: { x: 4, y: 0 },
      c: { x: 0, y: 3 },
    });
    expect(result).toBe(out);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 },
    ]);
  });

  test('tuple triangle([a, b, c])이 object triangle과 동일 결과를 만들고 순서를 보존한다', () => {
    const fromObject: XYObjectWritable[] = [];
    const fromTuple: XYObjectWritable[] = [];
    fromTriangleInto(fromObject, {
      a: { x: 1, y: 2 },
      b: { x: 3, y: 4 },
      c: { x: 5, y: 6 },
    });
    fromTriangleInto(fromTuple, [
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
    expect(fromTuple).toEqual(fromObject);
  });

  test('degenerate triangle(collinear, signedArea = 0)도 그대로 3개 vertex를 push한다', () => {
    const out: XYObjectWritable[] = [];
    fromTriangleInto(out, [
      [0, 0],
      [1, 1],
      [2, 2],
    ]);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ]);
  });

  test('동일 vertex 중복 triangle도 그대로 3개 vertex를 push한다', () => {
    const out: XYObjectWritable[] = [];
    fromTriangleInto(out, [
      [3, 3],
      [3, 3],
      [3, 3],
    ]);
    expect(out).toEqual([
      { x: 3, y: 3 },
      { x: 3, y: 3 },
      { x: 3, y: 3 },
    ]);
  });

  test('NaN vertex를 NaN 좌표로 pass-through한다', () => {
    const out: XYObjectWritable[] = [];
    fromTriangleInto(out, {
      a: { x: Number.NaN, y: 0 },
      b: { x: 1, y: 0 },
      c: { x: 0, y: 1 },
    });
    expect(out).toHaveLength(3);
    expect(Number.isNaN(out[0].x)).toBe(true);
    expect(out[1]).toEqual({ x: 1, y: 0 });
    expect(out[2]).toEqual({ x: 0, y: 1 });
  });

  test('+Infinity / -Infinity vertex를 그대로 pass-through한다', () => {
    const out: XYObjectWritable[] = [];
    fromTriangleInto(out, [
      [Number.POSITIVE_INFINITY, 0],
      [0, Number.NEGATIVE_INFINITY],
      [1, 1],
    ]);
    expect(out).toHaveLength(3);
    expect(out[0].x).toBe(Number.POSITIVE_INFINITY);
    expect(out[1].y).toBe(Number.NEGATIVE_INFINITY);
  });

  test('pre-populated out도 clear 후 정확히 3개 element만 남긴다', () => {
    const out: XYObjectWritable[] = [
      { x: 9, y: 9 },
      { x: 8, y: 8 },
      { x: 7, y: 7 },
      { x: 6, y: 6 },
    ];
    fromTriangleInto(out, [
      [0, 0],
      [1, 0],
      [0, 1],
    ]);
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ x: 0, y: 0 });
  });
});

// ──────────────────────────────────────────────
// fromTriangle (companion)
// ──────────────────────────────────────────────
describe('fromTriangle', () => {
  test('fromTriangleInto 결과와 동등한 { points } 를 반환한다', () => {
    const expected: XYObjectWritable[] = [];
    fromTriangleInto(expected, [
      [0, 0],
      [2, 0],
      [1, 2],
    ]);
    const actual = fromTriangle([
      [0, 0],
      [2, 0],
      [1, 2],
    ]);
    expect(actual.points).toEqual(expected);
  });

  test('매 호출마다 새 { points } object와 새 plain { x, y } element를 만든다', () => {
    const triangle = {
      a: { x: 0, y: 0 },
      b: { x: 1, y: 0 },
      c: { x: 0, y: 1 },
    };
    const r1 = fromTriangle(triangle);
    const r2 = fromTriangle(triangle);
    expect(r1).not.toBe(r2);
    expect(r1.points).not.toBe(r2.points);
    expect(r1.points[0]).not.toBe(r2.points[0]);
    expect(Object.getPrototypeOf(r1.points[0])).toBe(Object.prototype);
  });
});
