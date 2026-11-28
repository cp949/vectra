/** 두 무한 직선의 교차와 퇴화 분기를 확인한다. */
import { describe, expect, test } from 'vitest';
import { intersectsInfiniteLineInfiniteLine } from '../../../src/intersects/intersects-infinite-line-infinite-line';

const horizA = { ox: 0, oy: 0, dx: 1, dy: 0 };
const horizB = { ox: 0, oy: 1, dx: 1, dy: 0 };
const vertA = { ox: 0, oy: 0, dx: 0, dy: 1 };
const horizC = { ox: 5, oy: 0, dx: 1, dy: 0 };
const degA = { ox: 1, oy: 2, dx: 0, dy: 0 };
const degB = { ox: 1, oy: 2, dx: 0, dy: 0 };
const degC = { ox: 3, oy: 4, dx: 0, dy: 0 };

describe('intersectsInfiniteLine', () => {
  test('non-parallel → 항상 true', () => {
    expect(intersectsInfiniteLineInfiniteLine(horizA, vertA)).toBe(true);
  });

  test('collinear → true (무한히 겹침)', () => {
    expect(intersectsInfiniteLineInfiniteLine(horizA, horizC)).toBe(true);
  });

  test('parallel disjoint → false', () => {
    expect(intersectsInfiniteLineInfiniteLine(horizA, horizB)).toBe(false);
  });

  test('degenerate a, a.origin이 b 위 → true', () => {
    const degOnHoriz = { ox: 3, oy: 0, dx: 0, dy: 0 };
    expect(intersectsInfiniteLineInfiniteLine(degOnHoriz, horizA)).toBe(true);
  });

  test('degenerate a, a.origin이 b 위 아님 → false', () => {
    // degA origin=(1,2), horizA는 y=0
    expect(intersectsInfiniteLineInfiniteLine(degA, horizA)).toBe(false);
  });

  test('degenerate b, b.origin이 a 위 → true', () => {
    const degOnHoriz = { ox: 0, oy: 0, dx: 0, dy: 0 };
    expect(intersectsInfiniteLineInfiniteLine(horizA, degOnHoriz)).toBe(true);
  });

  test('양쪽 degenerate — origin 일치 → true', () => {
    expect(intersectsInfiniteLineInfiniteLine(degA, degB)).toBe(true);
  });

  test('양쪽 degenerate — origin 불일치 → false', () => {
    expect(intersectsInfiniteLineInfiniteLine(degA, degC)).toBe(false);
  });
});
