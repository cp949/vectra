import { describe, expect, test } from 'vitest';
import { sdfRect } from '../../../src/sdf/sdf-rect';
import { sdfRoundedRect } from '../../../src/sdf/sdf-rounded-rect';
import { NON_FINITE } from './_sdf-test-helpers';

describe('sdfRoundedRect', () => {
  // region [0,10] x [0,6], center (5,3), radius 2 (effective)
  const rect = { x: 0, y: 0, width: 10, height: 6 };

  test('radius 0은 같은 region sdfRect와 일치한다', () => {
    const aabb = { x: 0, y: 0, width: 10, height: 4 };
    for (const p of [
      { x: 5, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
      { x: 10, y: 4 },
      { x: 13, y: 2 },
      { x: 13, y: 6 },
    ]) {
      expect(sdfRoundedRect(aabb, 0, p)).toBeCloseTo(sdfRect(aabb, p), 12);
    }
  });

  test('interior point는 음수를 반환한다', () => {
    // center: nearest 직선 edge(top/bottom) 거리 3
    expect(sdfRoundedRect(rect, 2, { x: 5, y: 3 })).toBeCloseTo(-3, 12);
    // corner arc 내부 (1,1): arc center (2,2), 거리 sqrt(2) → sqrt(2)-2
    expect(sdfRoundedRect(rect, 2, { x: 1, y: 1 })).toBeCloseTo(Math.SQRT2 - 2, 12);
  });

  test('straight edge boundary는 0을 반환한다', () => {
    expect(sdfRoundedRect(rect, 2, { x: 5, y: 0 })).toBeCloseTo(0, 12); // 아래 직선 edge
    expect(sdfRoundedRect(rect, 2, { x: 0, y: 3 })).toBeCloseTo(0, 12); // 왼쪽 직선 edge
  });

  test('rounded corner boundary는 0을 반환한다', () => {
    // bottom-left arc center (2,2), 45° 경계점
    const t = 2 - Math.SQRT2;
    expect(sdfRoundedRect(rect, 2, { x: t, y: t })).toBeCloseTo(0, 12);
    // arc 바로 아래 경계 (2,0)
    expect(sdfRoundedRect(rect, 2, { x: 2, y: 0 })).toBeCloseTo(0, 12);
  });

  test('exterior axis point와 diagonal point는 양수 distance를 반환한다', () => {
    // (13,3): 오른쪽 직선 edge x=10 → 3
    expect(sdfRoundedRect(rect, 2, { x: 13, y: 3 })).toBeCloseTo(3, 12);
    // (13,9): top-right arc center (8,4), 거리 hypot(5,5) → -2
    expect(sdfRoundedRect(rect, 2, { x: 13, y: 9 })).toBeCloseTo(Math.hypot(5, 5) - 2, 12);
  });

  test('radius가 height/2를 초과하면 clamp된 결과를 반환한다', () => {
    const flat = { x: 0, y: 0, width: 10, height: 4 };
    // effective radius = min(10, 5, 2) = 2
    for (const p of [
      { x: 5, y: 2 },
      { x: 13, y: 2 },
      { x: 1, y: 1 },
      { x: -3, y: 5 },
    ]) {
      expect(sdfRoundedRect(flat, 10, p)).toBeCloseTo(sdfRoundedRect(flat, 2, p), 12);
    }
  });

  test('radius가 width/2를 초과하면 width-bound clamp된 결과를 반환한다', () => {
    const tall = { x: 0, y: 0, width: 4, height: 10 };
    // effective radius = min(10, 2, 5) = 2 (width/2가 binding term)
    for (const p of [
      { x: 2, y: 5 },
      { x: 2, y: 13 },
      { x: 1, y: 1 },
      { x: -3, y: 5 },
    ]) {
      expect(sdfRoundedRect(tall, 10, p)).toBeCloseTo(sdfRoundedRect(tall, 2, p), 12);
    }
  });

  test('zero width rect는 degenerate rect SDF(sdfRect)와 일치한다', () => {
    const line = { x: 5, y: 0, width: 0, height: 6 };
    for (const p of [
      { x: 5, y: 3 },
      { x: 8, y: 3 },
      { x: 5, y: 9 },
    ]) {
      expect(sdfRoundedRect(line, 2, p)).toBeCloseTo(sdfRect(line, p), 12);
    }
  });

  test('zero height rect도 degenerate rect SDF와 일치한다', () => {
    const line = { x: 0, y: 3, width: 10, height: 0 };
    for (const p of [
      { x: 5, y: 3 },
      { x: 5, y: 6 },
      { x: 13, y: 3 },
    ]) {
      expect(sdfRoundedRect(line, 2, p)).toBeCloseTo(sdfRect(line, p), 12);
    }
  });

  test('zero width/height rect(point)는 degenerate point distance(sdfRect)와 일치한다', () => {
    const pt = { x: 2, y: 3, width: 0, height: 0 };
    for (const p of [
      { x: 2, y: 3 }, // on point → 0
      { x: 5, y: 7 }, // distance 5
    ]) {
      expect(sdfRoundedRect(pt, 2, p)).toBeCloseTo(sdfRect(pt, p), 12);
    }
  });

  test('finite rect center 계산이 overflow해도 radius 0은 sdfRect와 일치한다', () => {
    const huge = Number.MAX_VALUE;
    const rectAtLimit = { x: huge, y: 0, width: huge, height: 4 };
    expect(sdfRoundedRect(rectAtLimit, 0, { x: huge, y: 2 })).toBe(sdfRect(rectAtLimit, { x: huge, y: 2 }));
  });

  test('finite rect inset 계산이 overflow해도 rounded boundary distance를 유지한다', () => {
    const huge = Number.MAX_VALUE;
    const rectAtLimit = { x: huge, y: 0, width: huge, height: huge };
    expect(sdfRoundedRect(rectAtLimit, huge / 2, { x: huge, y: huge / 2 })).toBe(0);
  });

  test('finite point-start 차이가 overflow해도 right inset distance를 유지한다', () => {
    const huge = Number.MAX_VALUE;
    const rectAtLimit = { x: -huge, y: 0, width: huge, height: 10 };
    expect(sdfRoundedRect(rectAtLimit, 1, { x: huge, y: 5 })).toBe(huge);
  });

  test('boundary 결과는 -0이 아닌 0이다', () => {
    expect(Object.is(sdfRoundedRect(rect, 2, { x: 5, y: 0 }), 0)).toBe(true);
  });

  test('tuple rect/point와 object rect/point가 같은 결과를 반환한다', () => {
    const fromObject = sdfRoundedRect({ x: 0, y: 0, width: 10, height: 6 }, 2, { x: 13, y: 3 });
    const fromTuple = sdfRoundedRect([0, 0, 10, 6], 2, [13, 3]);
    expect(fromTuple).toBe(fromObject);
    expect(fromTuple).toBe(3);
  });

  test('negative radius는 RangeError다', () => {
    expect(() => sdfRoundedRect(rect, -1, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite radius %p는 RangeError다', (bad) => {
    expect(() => sdfRoundedRect(rect, bad, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test('negative width는 RangeError다', () => {
    expect(() => sdfRoundedRect({ x: 0, y: 0, width: -1, height: 6 }, 2, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test('negative height는 RangeError다', () => {
    expect(() => sdfRoundedRect({ x: 0, y: 0, width: 10, height: -1 }, 2, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite width %p는 RangeError다', (bad) => {
    expect(() => sdfRoundedRect({ x: 0, y: 0, width: bad, height: 6 }, 2, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite height %p는 RangeError다', (bad) => {
    expect(() => sdfRoundedRect({ x: 0, y: 0, width: 10, height: bad }, 2, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite rect.x %p는 RangeError다', (bad) => {
    expect(() => sdfRoundedRect({ x: bad, y: 0, width: 10, height: 6 }, 2, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite rect.y %p는 RangeError다', (bad) => {
    expect(() => sdfRoundedRect({ x: 0, y: bad, width: 10, height: 6 }, 2, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point.x %p는 RangeError다', (bad) => {
    expect(() => sdfRoundedRect(rect, 2, { x: bad, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point.y %p는 RangeError다', (bad) => {
    expect(() => sdfRoundedRect(rect, 2, { x: 0, y: bad })).toThrow(RangeError);
  });
});
