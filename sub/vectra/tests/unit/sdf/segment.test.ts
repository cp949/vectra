/** 도형의 부호 있는 거리와 입력 검증을 확인한다. */
import { describe, expect, test } from 'vitest';
import { sdfSegment } from '../../../src/sdf/sdf-segment';
import { NON_FINITE } from './_sdf-test-helpers';

describe('sdfSegment', () => {
  // segment a(0,0) b(10,0)
  const segment = { x1: 0, y1: 0, x2: 10, y2: 0 };

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
    const point = { x1: 2, y1: 3, x2: 2, y2: 3 };
    expect(sdfSegment(point, { x: 2, y: 3 })).toBe(0);
    expect(sdfSegment(point, { x: 5, y: 7 })).toBe(5);
  });

  test('finite 좌표 차이가 overflow해도 closest point projection이 NaN이 되지 않는다', () => {
    const huge = Number.MAX_VALUE;
    expect(sdfSegment({ x1: -huge, y1: 0, x2: huge, y2: 0 }, { x: 0, y: 1 })).toBe(1);
  });

  test.each(NON_FINITE)('non-finite a.x %p는 RangeError다', (bad) => {
    expect(() => sdfSegment({ x1: bad, y1: 0, x2: 10, y2: 0 }, { x: 5, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite a.y %p는 RangeError다', (bad) => {
    expect(() => sdfSegment({ x1: 0, y1: bad, x2: 10, y2: 0 }, { x: 5, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite b.x %p는 RangeError다', (bad) => {
    expect(() => sdfSegment({ x1: 0, y1: 0, x2: bad, y2: 0 }, { x: 5, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite b.y %p는 RangeError다', (bad) => {
    expect(() => sdfSegment({ x1: 0, y1: 0, x2: 10, y2: bad }, { x: 5, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point.x %p는 RangeError다', (bad) => {
    expect(() => sdfSegment(segment, { x: bad, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point.y %p는 RangeError다', (bad) => {
    expect(() => sdfSegment(segment, { x: 5, y: bad })).toThrow(RangeError);
  });
});
