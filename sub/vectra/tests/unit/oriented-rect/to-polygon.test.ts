import { describe, expect, test } from 'vitest';
import { toPolygon } from '../../../src/oriented-rect/to-polygon';
import type { OrientedRectLike } from '../../../src/types';

// center (0,0), size 4×2, angle 0
const flat: OrientedRectLike = { center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: 0 };

describe('toPolygon - angle 0', () => {
  test('{ points } 4개를 TL→TR→BR→BL 순서로 반환한다', () => {
    const result = toPolygon(flat);
    expect(result).toEqual({
      points: [
        { x: -2, y: -1 },
        { x: 2, y: -1 },
        { x: 2, y: 1 },
        { x: -2, y: 1 },
      ],
    });
  });

  test('center offset을 반영한다', () => {
    const result = toPolygon({ center: { x: 3, y: 5 }, size: { x: 4, y: 2 }, angle: 0 });
    expect(result.points).toEqual([
      { x: 1, y: 4 },
      { x: 5, y: 4 },
      { x: 5, y: 6 },
      { x: 1, y: 6 },
    ]);
  });

  test('tuple input에서도 같은 vertex를 반환한다', () => {
    const result = toPolygon([[0, 0], [4, 2], 0]);
    expect(result.points).toEqual([
      { x: -2, y: -1 },
      { x: 2, y: -1 },
      { x: 2, y: 1 },
      { x: -2, y: 1 },
    ]);
  });
});

describe('toPolygon - 회전', () => {
  test('Math.PI / 2 회전 vertex를 close하게 반환한다', () => {
    const result = toPolygon({ center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: Math.PI / 2 });
    // TL(1,-2) TR(1,2) BR(-1,2) BL(-1,-2)
    expect(result.points[0].x).toBeCloseTo(1, 10);
    expect(result.points[0].y).toBeCloseTo(-2, 10);
    expect(result.points[1].x).toBeCloseTo(1, 10);
    expect(result.points[1].y).toBeCloseTo(2, 10);
    expect(result.points[2].x).toBeCloseTo(-1, 10);
    expect(result.points[2].y).toBeCloseTo(2, 10);
    expect(result.points[3].x).toBeCloseTo(-1, 10);
    expect(result.points[3].y).toBeCloseTo(-2, 10);
  });

  test('Math.PI / 4 회전 정사각형 vertex를 close하게 반환한다', () => {
    const result = toPolygon({ center: { x: 0, y: 0 }, size: { x: 2, y: 2 }, angle: Math.PI / 4 });
    // 정사각형 half-diagonal = √2. TL은 회전 후 (0, -√2)
    expect(result.points[0].x).toBeCloseTo(0, 10);
    expect(result.points[0].y).toBeCloseTo(-Math.SQRT2, 10);
  });
});

describe('toPolygon - empty raw corner', () => {
  test('size.x === 0은 raw corner 4개를 반환한다', () => {
    const result = toPolygon({ center: { x: 0, y: 0 }, size: { x: 0, y: 2 }, angle: 0 });
    expect(result.points).toEqual([
      { x: 0, y: -1 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: 0, y: 1 },
    ]);
  });

  test('negative size는 throw 없이 raw vertex 4개를 반환한다', () => {
    const result = toPolygon({ center: { x: 0, y: 0 }, size: { x: -4, y: 2 }, angle: 0 });
    expect(result.points).toHaveLength(4);
  });
});

describe('toPolygon - invalid size/angle', () => {
  test('size.x NaN이면 RangeError', () => {
    expect(() => toPolygon({ center: { x: 0, y: 0 }, size: { x: NaN, y: 2 }, angle: 0 })).toThrow(RangeError);
  });

  test('size.y Infinity이면 RangeError', () => {
    expect(() => toPolygon({ center: { x: 0, y: 0 }, size: { x: 4, y: Infinity }, angle: 0 })).toThrow(RangeError);
  });

  test('angle -Infinity이면 RangeError', () => {
    expect(() => toPolygon({ center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: -Infinity })).toThrow(RangeError);
  });
});

describe('toPolygon - center non-finite pass-through', () => {
  test('center.x Infinity는 throw 없이 vertex에 전파된다', () => {
    const result = toPolygon({ center: { x: Infinity, y: 0 }, size: { x: 4, y: 2 }, angle: 0 });
    expect(result.points[0].x).toBe(Infinity);
  });

  test('center.y NaN은 throw 없이 vertex에 NaN으로 전파된다', () => {
    const result = toPolygon({ center: { x: 0, y: NaN }, size: { x: 4, y: 2 }, angle: 0 });
    expect(Number.isNaN(result.points[0].y)).toBe(true);
  });

  test('center.x -Infinity는 throw 없이 vertex에 -Infinity로 전파된다', () => {
    // corner x = cx - hw*cos + hh*sin = -Infinity - 2 + 0
    const result = toPolygon({ center: { x: -Infinity, y: 0 }, size: { x: 4, y: 2 }, angle: 0 });
    expect(result.points[0].x).toBe(-Infinity);
  });
});

describe('toPolygon - companion freshness', () => {
  test('매 호출마다 새 polygon object와 새 point object를 반환한다', () => {
    const a = toPolygon(flat);
    const b = toPolygon(flat);
    expect(a).not.toBe(b);
    expect(a.points).not.toBe(b.points);
    expect(a.points[0]).not.toBe(b.points[0]);
  });
});
