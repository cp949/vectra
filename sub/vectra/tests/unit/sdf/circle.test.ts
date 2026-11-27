/** 도형의 부호 있는 거리와 입력 검증을 확인한다. */
import { describe, expect, test } from 'vitest';
import { sdfCircle } from '../../../src/sdf/sdf-circle';
import { NON_FINITE } from './_sdf-test-helpers';

describe('sdfCircle', () => {
  test('center point는 -radius를 반환한다 (interior)', () => {
    expect(sdfCircle({ cx: 0, cy: 0, r: 5 }, { x: 0, y: 0 })).toBe(-5);
    expect(sdfCircle({ cx: 3, cy: -2, r: 4 }, { x: 3, y: -2 })).toBe(-4);
  });

  test('boundary point는 0을 반환한다', () => {
    expect(sdfCircle({ cx: 0, cy: 0, r: 5 }, { x: 5, y: 0 })).toBe(0);
    expect(sdfCircle({ cx: 0, cy: 0, r: 5 }, { x: 0, y: -5 })).toBe(0);
  });

  test('outside point는 양수 distance를 반환한다', () => {
    expect(sdfCircle({ cx: 0, cy: 0, r: 5 }, { x: 8, y: 0 })).toBe(3);
    expect(sdfCircle({ cx: 0, cy: 0, r: 3 }, { x: 0, y: 8 })).toBe(5);
  });

  test('interior point는 음수를 반환한다', () => {
    // center에서 (2,0), radius 5 → 거리 2 - 5 = -3
    expect(sdfCircle({ cx: 0, cy: 0, r: 5 }, { x: 2, y: 0 })).toBe(-3);
  });

  test('radius 0은 point distance와 같다', () => {
    expect(sdfCircle({ cx: 0, cy: 0, r: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(sdfCircle({ cx: 0, cy: 0, r: 0 }, { x: 0, y: 0 })).toBe(0);
  });

  test('negative radius는 RangeError다', () => {
    expect(() => sdfCircle({ cx: 0, cy: 0, r: -1 }, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite radius %p는 RangeError다', (bad) => {
    expect(() => sdfCircle({ cx: 0, cy: 0, r: bad }, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite center.x %p는 RangeError다', (bad) => {
    expect(() => sdfCircle({ cx: bad, cy: 0, r: 1 }, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite center.y %p는 RangeError다', (bad) => {
    expect(() => sdfCircle({ cx: 0, cy: bad, r: 1 }, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point.x %p는 RangeError다', (bad) => {
    expect(() => sdfCircle({ cx: 0, cy: 0, r: 1 }, { x: bad, y: 0 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point.y %p는 RangeError다', (bad) => {
    expect(() => sdfCircle({ cx: 0, cy: 0, r: 1 }, { x: 0, y: bad })).toThrow(RangeError);
  });
});
