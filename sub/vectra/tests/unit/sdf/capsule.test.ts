import { describe, expect, test } from 'vitest';
import { sdfCapsule } from '../../../src/sdf/sdf-capsule';
import { sdfCircle } from '../../../src/sdf/sdf-circle';
import { NON_FINITE } from './_sdf-test-helpers';

describe('sdfCapsule', () => {
  // capsule a(0,0) b(10,0) radius 2
  const capsule = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, radius: 2 };

  test('axis 위 interior point는 -radius를 반환한다', () => {
    expect(sdfCapsule(capsule, { x: 5, y: 0 })).toBe(-2);
    expect(sdfCapsule(capsule, { x: 0, y: 0 })).toBe(-2);
  });

  test('side boundary point는 0을 반환한다', () => {
    expect(sdfCapsule(capsule, { x: 5, y: 2 })).toBe(0);
    expect(sdfCapsule(capsule, { x: 5, y: -2 })).toBe(0);
  });

  test('cap boundary point는 0을 반환한다', () => {
    // endpoint (10,0)에서 radius 거리 → (12,0)
    expect(sdfCapsule(capsule, { x: 12, y: 0 })).toBe(0);
    // endpoint (0,0)에서 radius 거리 → (-2,0)
    expect(sdfCapsule(capsule, { x: -2, y: 0 })).toBe(0);
  });

  test('outside point는 양수 distance를 반환한다', () => {
    // (5,5) axisDist 5 - radius 2 = 3
    expect(sdfCapsule(capsule, { x: 5, y: 5 })).toBe(3);
    // (13,0) axisDist 3 - radius 2 = 1
    expect(sdfCapsule(capsule, { x: 13, y: 0 })).toBe(1);
  });

  test('vertical axis capsule도 sign convention을 유지한다', () => {
    // axis a(0,0) b(0,10) radius 2
    const vertical = { a: { x: 0, y: 0 }, b: { x: 0, y: 10 }, radius: 2 };
    expect(sdfCapsule(vertical, { x: 0, y: 5 })).toBe(-2); // axis 위 interior
    expect(sdfCapsule(vertical, { x: 2, y: 5 })).toBe(0); // side boundary
    expect(sdfCapsule(vertical, { x: 0, y: 12 })).toBe(0); // cap boundary
    expect(sdfCapsule(vertical, { x: 5, y: 5 })).toBe(3); // side exterior
  });

  test('diagonal axis capsule도 perpendicular distance로 측정한다', () => {
    // axis a(0,0) b(6,8) length 10, radius 1
    const diagonal = { a: { x: 0, y: 0 }, b: { x: 6, y: 8 }, radius: 1 };
    expect(sdfCapsule(diagonal, { x: 3, y: 4 })).toBe(-1); // midpoint interior
    // midpoint에서 perpendicular로 5만큼 떨어진 (-1,7): axisDist 5 - radius 1 = 4
    expect(sdfCapsule(diagonal, { x: -1, y: 7 })).toBeCloseTo(4, 12);
  });

  test('zero-axis capsule은 같은 center/radius circle과 같은 결과를 반환한다', () => {
    const zeroAxis = { a: { x: 1, y: 1 }, b: { x: 1, y: 1 }, radius: 3 };
    for (const p of [
      { x: 1, y: 1 },
      { x: 4, y: 5 },
      { x: 1, y: 1.5 },
      { x: -10, y: 20 },
    ]) {
      expect(sdfCapsule(zeroAxis, p)).toBe(sdfCircle({ center: { x: 1, y: 1 }, radius: 3 }, p));
    }
  });

  test('tuple input과 object input이 같은 결과를 반환한다', () => {
    const fromObject = sdfCapsule(capsule, { x: 5, y: 5 });
    const fromTuple = sdfCapsule([[0, 0], [10, 0], 2], [5, 5]);
    expect(fromTuple).toBe(fromObject);
    expect(fromTuple).toBe(3);
  });

  test('zero-axis degenerate에서 tuple과 object가 일치한다', () => {
    const fromObject = sdfCapsule({ a: { x: 1, y: 1 }, b: { x: 1, y: 1 }, radius: 3 }, { x: 4, y: 5 });
    const fromTuple = sdfCapsule([[1, 1], [1, 1], 3], [4, 5]);
    expect(fromTuple).toBe(fromObject);
    expect(fromTuple).toBe(2);
  });

  test('finite 좌표 차이가 overflow해도 axis distance가 NaN이 되지 않는다', () => {
    const huge = Number.MAX_VALUE;
    expect(sdfCapsule({ a: { x: -huge, y: 0 }, b: { x: huge, y: 0 }, radius: 0.25 }, { x: 0, y: 1 })).toBe(0.75);
  });

  test('finite axis distance 제곱이 overflow해도 signed distance는 finite distance를 유지한다', () => {
    const far = Number.MAX_VALUE / 2;
    expect(sdfCapsule({ a: { x: 0, y: 0 }, b: { x: 0, y: 0 }, radius: 1 }, { x: far, y: 0 })).toBe(far);
  });

  test('negative radius는 RangeError다', () => {
    expect(() => sdfCapsule({ a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, radius: -1 }, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite radius %p는 RangeError다', (bad) => {
    expect(() => sdfCapsule({ a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, radius: bad }, { x: 0, y: 0 })).toThrow(
      RangeError
    );
  });

  test.each(NON_FINITE)('non-finite a.x %p는 RangeError다', (bad) => {
    expect(() => sdfCapsule({ a: { x: bad, y: 0 }, b: { x: 10, y: 0 }, radius: 2 }, { x: 5, y: 0 })).toThrow(
      RangeError
    );
  });

  test.each(NON_FINITE)('non-finite a.y %p는 RangeError다', (bad) => {
    expect(() => sdfCapsule({ a: { x: 0, y: bad }, b: { x: 10, y: 0 }, radius: 2 }, { x: 5, y: 0 })).toThrow(
      RangeError
    );
  });

  test.each(NON_FINITE)('non-finite b.x %p는 RangeError다', (bad) => {
    expect(() => sdfCapsule({ a: { x: 0, y: 0 }, b: { x: bad, y: 0 }, radius: 2 }, { x: 5, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite b.y %p는 RangeError다', (bad) => {
    expect(() => sdfCapsule({ a: { x: 0, y: 0 }, b: { x: 10, y: bad }, radius: 2 }, { x: 5, y: 0 })).toThrow(
      RangeError
    );
  });

  test.each(NON_FINITE)('non-finite point.x %p는 RangeError다', (bad) => {
    expect(() => sdfCapsule(capsule, { x: bad, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point.y %p는 RangeError다', (bad) => {
    expect(() => sdfCapsule(capsule, { x: 5, y: bad })).toThrow(RangeError);
  });
});

// S11-RM-019: SDF extended primitive helpers
