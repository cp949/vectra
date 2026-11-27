/** 회전 사각형의 교차 배치 다각형 좌표와 꼭짓점 순서를 검증한다. */
import { describe, expect, test } from 'vitest';
import { toPolygon } from '../../../src/oriented-rect/to-polygon';
import type { OrientedRect } from '../../../src/types/flat-shapes.internal';

// center (0,0), size 4×2, angle 0
const flat: OrientedRect = { cx: 0, cy: 0, width: 4, height: 2, angle: 0 };

describe('toPolygon - angle 0', () => {
  test('좌표 8개를 TL→TR→BR→BL 순서로 반환한다', () => {
    const result = toPolygon(flat);
    expect(result).toEqual([-2, -1, 2, -1, 2, 1, -2, 1]);
  });

  test('center offset을 반영한다', () => {
    const result = toPolygon({ cx: 3, cy: 5, width: 4, height: 2, angle: 0 });
    expect(result).toEqual([1, 4, 5, 4, 5, 6, 1, 6]);
  });
});

describe('toPolygon - 회전', () => {
  test('Math.PI / 2 회전 vertex를 close하게 반환한다', () => {
    const result = toPolygon({ cx: 0, cy: 0, width: 4, height: 2, angle: Math.PI / 2 });
    // TL(1,-2) TR(1,2) BR(-1,2) BL(-1,-2)
    expect(result[0]).toBeCloseTo(1, 10);
    expect(result[1]).toBeCloseTo(-2, 10);
    expect(result[2]).toBeCloseTo(1, 10);
    expect(result[3]).toBeCloseTo(2, 10);
    expect(result[4]).toBeCloseTo(-1, 10);
    expect(result[5]).toBeCloseTo(2, 10);
    expect(result[6]).toBeCloseTo(-1, 10);
    expect(result[7]).toBeCloseTo(-2, 10);
  });

  test('Math.PI / 4 회전 정사각형 vertex를 close하게 반환한다', () => {
    const result = toPolygon({ cx: 0, cy: 0, width: 2, height: 2, angle: Math.PI / 4 });
    // 정사각형 half-diagonal = √2. TL은 회전 후 (0, -√2)
    expect(result[0]).toBeCloseTo(0, 10);
    expect(result[1]).toBeCloseTo(-Math.SQRT2, 10);
  });
});

describe('toPolygon - empty raw corner', () => {
  test('width === 0은 raw corner 4개를 반환한다', () => {
    const result = toPolygon({ cx: 0, cy: 0, width: 0, height: 2, angle: 0 });
    expect(result).toEqual([0, -1, 0, -1, 0, 1, 0, 1]);
  });

  test('negative size는 throw 없이 raw vertex 4개를 반환한다', () => {
    const result = toPolygon({ cx: 0, cy: 0, width: -4, height: 2, angle: 0 });
    expect(result).toHaveLength(8);
  });
});

describe('toPolygon - invalid size/angle', () => {
  test('width NaN이면 RangeError', () => {
    expect(() => toPolygon({ cx: 0, cy: 0, width: NaN, height: 2, angle: 0 })).toThrow(RangeError);
  });

  test('height Infinity이면 RangeError', () => {
    expect(() => toPolygon({ cx: 0, cy: 0, width: 4, height: Infinity, angle: 0 })).toThrow(RangeError);
  });

  test('angle -Infinity이면 RangeError', () => {
    expect(() => toPolygon({ cx: 0, cy: 0, width: 4, height: 2, angle: -Infinity })).toThrow(RangeError);
  });
});

describe('toPolygon - center non-finite pass-through', () => {
  test('cx Infinity는 throw 없이 vertex에 전파된다', () => {
    const result = toPolygon({ cx: Infinity, cy: 0, width: 4, height: 2, angle: 0 });
    expect(result[0]).toBe(Infinity);
  });

  test('cy NaN은 throw 없이 vertex에 NaN으로 전파된다', () => {
    const result = toPolygon({ cx: 0, cy: NaN, width: 4, height: 2, angle: 0 });
    expect(Number.isNaN(result[1])).toBe(true);
  });

  test('cx -Infinity는 throw 없이 vertex에 -Infinity로 전파된다', () => {
    // corner x = cx - hw*cos + hh*sin = -Infinity - 2 + 0
    const result = toPolygon({ cx: -Infinity, cy: 0, width: 4, height: 2, angle: 0 });
    expect(result[0]).toBe(-Infinity);
  });
});

describe('toPolygon - companion freshness', () => {
  test('매 호출마다 새 좌표 배열을 반환한다', () => {
    const a = toPolygon(flat);
    const b = toPolygon(flat);
    expect(a).not.toBe(b);
  });
});
