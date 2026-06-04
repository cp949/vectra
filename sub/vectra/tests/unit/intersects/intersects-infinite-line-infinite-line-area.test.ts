import { describe, expect, test } from 'vitest';
import { infiniteLineFrom } from '../../../src/infinite-line/infinite-line-from';
import { intersectsInfiniteLineInfiniteLine } from '../../../src/intersects/intersects-infinite-line-infinite-line';

const horizA = infiniteLineFrom({ x: 0, y: 0 }, { x: 1, y: 0 });
const horizB = infiniteLineFrom({ x: 0, y: 1 }, { x: 1, y: 0 });
const vertA = infiniteLineFrom({ x: 0, y: 0 }, { x: 0, y: 1 });
const horizC = infiniteLineFrom({ x: 5, y: 0 }, { x: 1, y: 0 });
const degA = infiniteLineFrom({ x: 1, y: 2 }, { x: 0, y: 0 });
const degB = infiniteLineFrom({ x: 1, y: 2 }, { x: 0, y: 0 });
const degC = infiniteLineFrom({ x: 3, y: 4 }, { x: 0, y: 0 });

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
    const degOnHoriz = infiniteLineFrom({ x: 3, y: 0 }, { x: 0, y: 0 });
    expect(intersectsInfiniteLineInfiniteLine(degOnHoriz, horizA)).toBe(true);
  });

  test('degenerate a, a.origin이 b 위 아님 → false', () => {
    // degA origin=(1,2), horizA는 y=0
    expect(intersectsInfiniteLineInfiniteLine(degA, horizA)).toBe(false);
  });

  test('degenerate b, b.origin이 a 위 → true', () => {
    const degOnHoriz = infiniteLineFrom({ x: 0, y: 0 }, { x: 0, y: 0 });
    expect(intersectsInfiniteLineInfiniteLine(horizA, degOnHoriz)).toBe(true);
  });

  test('양쪽 degenerate — origin 일치 → true', () => {
    expect(intersectsInfiniteLineInfiniteLine(degA, degB)).toBe(true);
  });

  test('양쪽 degenerate — origin 불일치 → false', () => {
    expect(intersectsInfiniteLineInfiniteLine(degA, degC)).toBe(false);
  });
});
