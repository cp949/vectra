import { describe, expect, test } from 'vitest';
import { intersectsInfiniteLineInfiniteLine } from '../../../src/intersects/intersects-infinite-line-infinite-line';

const horizA = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
const horizB = { origin: { x: 0, y: 1 }, direction: { x: 1, y: 0 } };
const vertA = { origin: { x: 0, y: 0 }, direction: { x: 0, y: 1 } };
const horizC = { origin: { x: 5, y: 0 }, direction: { x: 1, y: 0 } };
const degA = { origin: { x: 1, y: 2 }, direction: { x: 0, y: 0 } };
const degB = { origin: { x: 1, y: 2 }, direction: { x: 0, y: 0 } };
const degC = { origin: { x: 3, y: 4 }, direction: { x: 0, y: 0 } };

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
    const degOnHoriz = { origin: { x: 3, y: 0 }, direction: { x: 0, y: 0 } };
    expect(intersectsInfiniteLineInfiniteLine(degOnHoriz, horizA)).toBe(true);
  });

  test('degenerate a, a.origin이 b 위 아님 → false', () => {
    // degA origin=(1,2), horizA는 y=0
    expect(intersectsInfiniteLineInfiniteLine(degA, horizA)).toBe(false);
  });

  test('degenerate b, b.origin이 a 위 → true', () => {
    const degOnHoriz = { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } };
    expect(intersectsInfiniteLineInfiniteLine(horizA, degOnHoriz)).toBe(true);
  });

  test('양쪽 degenerate — origin 일치 → true', () => {
    expect(intersectsInfiniteLineInfiniteLine(degA, degB)).toBe(true);
  });

  test('양쪽 degenerate — origin 불일치 → false', () => {
    expect(intersectsInfiniteLineInfiniteLine(degA, degC)).toBe(false);
  });
});
