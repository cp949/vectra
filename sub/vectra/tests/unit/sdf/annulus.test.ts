import { describe, expect, test } from 'vitest';
import { sdfAnnulus } from '../../../src/sdf/sdf-annulus';
import { sdfCircle } from '../../../src/sdf/sdf-circle';
import { NON_FINITE } from './_sdf-test-helpers';

describe('sdfAnnulus', () => {
  // outer circle center (0,0) radius 5, innerRadius 2
  const circle = { center: { x: 0, y: 0 }, radius: 5 };

  test('inner hole 내부 point는 양수 distance를 반환한다', () => {
    // d=1 < inner 2 → 2 - 1 = 1
    expect(sdfAnnulus(circle, 2, { x: 1, y: 0 })).toBe(1);
    expect(sdfAnnulus(circle, 2, { x: 0, y: 0 })).toBe(2);
  });

  test('ring interior point는 음수를 반환한다', () => {
    // d=3.5 midline → nearest boundary 1.5
    expect(sdfAnnulus(circle, 2, { x: 3.5, y: 0 })).toBe(-1.5);
  });

  test('inner boundary와 outer boundary는 0을 반환한다', () => {
    expect(sdfAnnulus(circle, 2, { x: 2, y: 0 })).toBe(0);
    expect(sdfAnnulus(circle, 2, { x: 5, y: 0 })).toBe(0);
    expect(sdfAnnulus(circle, 2, { x: 0, y: -2 })).toBe(0);
  });

  test('exterior point는 양수 distance를 반환한다', () => {
    // d=8 > outer 5 → 3
    expect(sdfAnnulus(circle, 2, { x: 8, y: 0 })).toBe(3);
  });

  test('innerRadius 0은 filled disk sdfCircle과 일치한다', () => {
    for (const p of [
      { x: 0, y: 0 }, // center → -5
      { x: 2, y: 0 }, // interior
      { x: 5, y: 0 }, // boundary
      { x: 8, y: 0 }, // exterior
      { x: 3, y: 4 }, // boundary diagonal
    ]) {
      expect(sdfAnnulus(circle, 0, p)).toBe(sdfCircle(circle, p));
    }
  });

  test('innerRadius === outerRadius는 circle boundary distance를 반환한다', () => {
    // ring이 zero-thickness → unsigned |d - 5|, interior 음수 없음
    expect(sdfAnnulus(circle, 5, { x: 0, y: 0 })).toBe(5);
    expect(sdfAnnulus(circle, 5, { x: 3, y: 0 })).toBe(2);
    expect(sdfAnnulus(circle, 5, { x: 8, y: 0 })).toBe(3);
    expect(sdfAnnulus(circle, 5, { x: 5, y: 0 })).toBe(0);
  });

  test('tuple input과 object input이 같은 결과를 반환한다', () => {
    const fromObject = sdfAnnulus({ center: { x: 0, y: 0 }, radius: 5 }, 2, { x: 1, y: 0 });
    const fromTuple = sdfAnnulus([[0, 0], 5], 2, [1, 0]);
    expect(fromTuple).toBe(fromObject);
    expect(fromTuple).toBe(1);
  });

  test('boundary 결과는 -0이 아닌 0이다', () => {
    expect(Object.is(sdfAnnulus(circle, 2, { x: 5, y: 0 }), 0)).toBe(true);
    expect(Object.is(sdfAnnulus(circle, 2, { x: 2, y: 0 }), 0)).toBe(true);
  });

  test('zero-thickness ring(inner === outer) boundary 결과는 -0이 아닌 0이다', () => {
    expect(Object.is(sdfAnnulus(circle, 5, { x: 5, y: 0 }), 0)).toBe(true);
  });

  test('negative innerRadius는 RangeError다', () => {
    expect(() => sdfAnnulus(circle, -1, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test('negative outerRadius는 RangeError다', () => {
    expect(() => sdfAnnulus({ center: { x: 0, y: 0 }, radius: -1 }, 0, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test('innerRadius > outerRadius는 RangeError다', () => {
    expect(() => sdfAnnulus(circle, 6, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite innerRadius %p는 RangeError다', (bad) => {
    expect(() => sdfAnnulus(circle, bad, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite outerRadius %p는 RangeError다', (bad) => {
    expect(() => sdfAnnulus({ center: { x: 0, y: 0 }, radius: bad }, 2, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite center.x %p는 RangeError다', (bad) => {
    expect(() => sdfAnnulus({ center: { x: bad, y: 0 }, radius: 5 }, 2, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite center.y %p는 RangeError다', (bad) => {
    expect(() => sdfAnnulus({ center: { x: 0, y: bad }, radius: 5 }, 2, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point.x %p는 RangeError다', (bad) => {
    expect(() => sdfAnnulus(circle, 2, { x: bad, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point.y %p는 RangeError다', (bad) => {
    expect(() => sdfAnnulus(circle, 2, { x: 0, y: bad })).toThrow(RangeError);
  });
});
