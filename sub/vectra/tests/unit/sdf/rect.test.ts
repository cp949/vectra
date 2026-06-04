import { describe, expect, test } from 'vitest';
import { sdfRect } from '../../../src/sdf/sdf-rect';
import { NON_FINITE } from './_sdf-test-helpers';

describe('sdfRect', () => {
  // region [0,10] x [0,4], center (5,2)
  const rect = { x: 0, y: 0, width: 10, height: 4 };

  test('inside point는 음수를 반환한다 (nearest edge 거리)', () => {
    // (5,2)에서 nearest edge는 top/bottom 거리 2
    expect(sdfRect(rect, { x: 5, y: 2 })).toBe(-2);
    // (1,2)에서 nearest edge는 left 거리 1
    expect(sdfRect(rect, { x: 1, y: 2 })).toBe(-1);
  });

  test('edge boundary point는 0을 반환한다', () => {
    expect(sdfRect(rect, { x: 0, y: 2 })).toBe(0);
    expect(sdfRect(rect, { x: 10, y: 2 })).toBe(0);
    expect(sdfRect(rect, { x: 5, y: 0 })).toBe(0);
    expect(sdfRect(rect, { x: 5, y: 4 })).toBe(0);
  });

  test('corner boundary point는 0을 반환한다', () => {
    expect(sdfRect(rect, { x: 0, y: 0 })).toBe(0);
    expect(sdfRect(rect, { x: 10, y: 4 })).toBe(0);
  });

  test('axis-aligned outside point는 양수 distance를 반환한다', () => {
    expect(sdfRect(rect, { x: 13, y: 2 })).toBe(3);
    expect(sdfRect(rect, { x: 5, y: -2 })).toBe(2);
  });

  test('diagonal outside point는 nearest corner까지 distance를 반환한다', () => {
    // (13,6) nearest corner (10,4) → sqrt(9+4)
    expect(sdfRect(rect, { x: 13, y: 6 })).toBeCloseTo(Math.sqrt(13), 12);
  });

  test('tuple input과 object input이 같은 결과를 반환한다', () => {
    const fromObject = sdfRect(rect, { x: 13, y: 2 });
    const fromTuple = sdfRect([0, 0, 10, 4], [13, 2]);
    expect(fromTuple).toBe(fromObject);
  });

  test('tall rect(width<height)도 sign convention을 유지한다', () => {
    // region [0,4] x [0,10], center (2,5)
    const tall = { x: 0, y: 0, width: 4, height: 10 };
    // interior: nearest edge는 left/right 거리 2
    expect(sdfRect(tall, { x: 2, y: 5 })).toBe(-2);
    // qy > qx exterior: top edge(y=10) 위 거리 3
    expect(sdfRect(tall, { x: 2, y: 13 })).toBe(3);
    // corner exterior: nearest corner (4,10) → sqrt(4+9)
    expect(sdfRect(tall, { x: 6, y: 13 })).toBeCloseTo(Math.sqrt(13), 12);
  });

  test('negative-origin rect도 sign convention을 유지한다', () => {
    // region [-5,5] x [-3,1], center (0,-1)
    const neg = { x: -5, y: -3, width: 10, height: 4 };
    // interior: nearest edge는 top/bottom 거리 2
    expect(sdfRect(neg, { x: 0, y: -1 })).toBe(-2);
    // left edge boundary
    expect(sdfRect(neg, { x: -5, y: -1 })).toBe(0);
    // right edge 바깥 거리 3
    expect(sdfRect(neg, { x: 8, y: -1 })).toBe(3);
  });

  test('finite rect center 계산이 overflow해도 boundary와 interior distance를 유지한다', () => {
    const huge = Number.MAX_VALUE;
    const rectAtLimit = { x: huge, y: 0, width: huge, height: 4 };
    expect(sdfRect(rectAtLimit, { x: huge, y: 2 })).toBe(0);

    const interiorFromLeft = { x: huge / 2, y: huge / 2, width: huge, height: huge };
    expect(sdfRect(interiorFromLeft, { x: huge, y: huge })).toBe(-(huge / 2));
  });

  test('zero-width degenerate에서 tuple과 object가 일치한다', () => {
    const fromObject = sdfRect({ x: 5, y: 0, width: 0, height: 4 }, { x: 8, y: 2 });
    const fromTuple = sdfRect([5, 0, 0, 4], [8, 2]);
    expect(fromTuple).toBe(fromObject);
    expect(fromTuple).toBe(3);
  });

  test('zero-width rect는 interior 없이 segment distance를 반환한다', () => {
    // x=5, y∈[0,4] 수직 segment
    const line = { x: 5, y: 0, width: 0, height: 4 };
    expect(sdfRect(line, { x: 5, y: 2 })).toBe(0);
    expect(sdfRect(line, { x: 8, y: 2 })).toBe(3);
    expect(sdfRect(line, { x: 5, y: 6 })).toBe(2);
  });

  test('zero-height rect는 interior 없이 segment distance를 반환한다', () => {
    // y=2, x∈[0,10] 수평 segment
    const line = { x: 0, y: 2, width: 10, height: 0 };
    expect(sdfRect(line, { x: 5, y: 2 })).toBe(0);
    expect(sdfRect(line, { x: 5, y: 5 })).toBe(3);
    expect(sdfRect(line, { x: 13, y: 2 })).toBe(3);
  });

  test('zero-area rect는 point distance를 반환한다', () => {
    const point = { x: 2, y: 3, width: 0, height: 0 };
    expect(sdfRect(point, { x: 2, y: 3 })).toBe(0);
    expect(sdfRect(point, { x: 5, y: 7 })).toBe(5);
  });

  test('negative width는 RangeError다', () => {
    expect(() => sdfRect({ x: 0, y: 0, width: -1, height: 4 }, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test('negative height는 RangeError다', () => {
    expect(() => sdfRect({ x: 0, y: 0, width: 10, height: -1 }, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite width %p는 RangeError다', (bad) => {
    expect(() => sdfRect({ x: 0, y: 0, width: bad, height: 4 }, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite height %p는 RangeError다', (bad) => {
    expect(() => sdfRect({ x: 0, y: 0, width: 10, height: bad }, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite rect.x %p는 RangeError다', (bad) => {
    expect(() => sdfRect({ x: bad, y: 0, width: 10, height: 4 }, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite rect.y %p는 RangeError다', (bad) => {
    expect(() => sdfRect({ x: 0, y: bad, width: 10, height: 4 }, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point.x %p는 RangeError다', (bad) => {
    expect(() => sdfRect(rect, { x: bad, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point.y %p는 RangeError다', (bad) => {
    expect(() => sdfRect(rect, { x: 0, y: bad })).toThrow(RangeError);
  });
});
