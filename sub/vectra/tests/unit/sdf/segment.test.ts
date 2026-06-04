import { describe, expect, test } from 'vitest';
import { sdfSegment } from '../../../src/sdf/sdf-segment';
import { NON_FINITE } from './_sdf-test-helpers';

describe('sdfSegment', () => {
  // segment a(0,0) b(10,0)
  const segment = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };

  test('segment 위 point는 0을 반환한다', () => {
    expect(sdfSegment(segment, { x: 5, y: 0 })).toBe(0);
    expect(sdfSegment(segment, { x: 0, y: 0 })).toBe(0);
    expect(sdfSegment(segment, { x: 10, y: 0 })).toBe(0);
  });

  test('projection 영역 바깥 point는 양수 distance를 반환한다', () => {
    // (5,3) closest (5,0) → 3
    expect(sdfSegment(segment, { x: 5, y: 3 })).toBe(3);
  });

  test('endpoint 바깥 point는 endpoint까지 distance를 반환한다', () => {
    // (12,0) closest (10,0) → 2
    expect(sdfSegment(segment, { x: 12, y: 0 })).toBe(2);
    // (13,4) closest (10,0) → sqrt(9+16) = 5
    expect(sdfSegment(segment, { x: 13, y: 4 })).toBe(5);
  });

  test('zero-length segment는 point distance를 반환한다', () => {
    const point = { a: { x: 2, y: 3 }, b: { x: 2, y: 3 } };
    expect(sdfSegment(point, { x: 2, y: 3 })).toBe(0);
    expect(sdfSegment(point, { x: 5, y: 7 })).toBe(5);
  });

  test('zero-length degenerate에서 tuple과 object가 일치한다', () => {
    const fromObject = sdfSegment({ a: { x: 2, y: 3 }, b: { x: 2, y: 3 } }, { x: 5, y: 7 });
    const fromTuple = sdfSegment(
      [
        [2, 3],
        [2, 3],
      ],
      [5, 7]
    );
    expect(fromTuple).toBe(fromObject);
    expect(fromTuple).toBe(5);
  });

  test('tuple input과 object input이 같은 결과를 반환한다', () => {
    const fromObject = sdfSegment(segment, { x: 5, y: 3 });
    const fromTuple = sdfSegment(
      [
        [0, 0],
        [10, 0],
      ],
      [5, 3]
    );
    expect(fromTuple).toBe(fromObject);
    expect(fromTuple).toBe(3);
  });

  test('finite 좌표 차이가 overflow해도 closest point projection이 NaN이 되지 않는다', () => {
    const huge = Number.MAX_VALUE;
    expect(sdfSegment({ a: { x: -huge, y: 0 }, b: { x: huge, y: 0 } }, { x: 0, y: 1 })).toBe(1);
  });

  test.each(NON_FINITE)('non-finite a.x %p는 RangeError다', (bad) => {
    expect(() => sdfSegment({ a: { x: bad, y: 0 }, b: { x: 10, y: 0 } }, { x: 5, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite a.y %p는 RangeError다', (bad) => {
    expect(() => sdfSegment({ a: { x: 0, y: bad }, b: { x: 10, y: 0 } }, { x: 5, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite b.x %p는 RangeError다', (bad) => {
    expect(() => sdfSegment({ a: { x: 0, y: 0 }, b: { x: bad, y: 0 } }, { x: 5, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite b.y %p는 RangeError다', (bad) => {
    expect(() => sdfSegment({ a: { x: 0, y: 0 }, b: { x: 10, y: bad } }, { x: 5, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point.x %p는 RangeError다', (bad) => {
    expect(() => sdfSegment(segment, { x: bad, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point.y %p는 RangeError다', (bad) => {
    expect(() => sdfSegment(segment, { x: 5, y: bad })).toThrow(RangeError);
  });
});
