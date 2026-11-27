/**
 * vec isInQuadrant 단위 테스트.
 *
 * 각 사분면 대표점, 불일치, 축 위 점(quadrant 0)을 검증한다.
 * quadrant(input) === q 와 동일하게 동작함을 함께 확인한다.
 */
import { describe, expect, test } from 'vitest';
import { isInQuadrant } from '../../../src/vec/is-in-quadrant';
import { quadrant } from '../../../src/vec/quadrant';

describe('vec isInQuadrant', () => {
  test('각 사분면 대표점에서 true를 반환한다', () => {
    expect(isInQuadrant({ x: 1, y: 1 }, 1)).toBe(true);
    expect(isInQuadrant({ x: -1, y: 1 }, 2)).toBe(true);
    expect(isInQuadrant({ x: -1, y: -1 }, 3)).toBe(true);
    expect(isInQuadrant({ x: 1, y: -1 }, 4)).toBe(true);
  });

  test('사분면이 다르면 false를 반환한다', () => {
    expect(isInQuadrant({ x: 1, y: 1 }, 2)).toBe(false);
    expect(isInQuadrant({ x: 1, y: 1 }, 0)).toBe(false);
    expect(isInQuadrant({ x: -1, y: -1 }, 1)).toBe(false);
  });

  test('축 위 점은 quadrant 0으로 본다', () => {
    expect(isInQuadrant({ x: 0, y: 5 }, 0)).toBe(true);
    expect(isInQuadrant({ x: 5, y: 0 }, 0)).toBe(true);
    expect(isInQuadrant({ x: 0, y: 0 }, 0)).toBe(true);
    expect(isInQuadrant({ x: 0, y: 5 }, 1)).toBe(false);
  });

  test('quadrant(input) === q 와 동일하게 동작한다', () => {
    const points: ReadonlyArray<{ x: number; y: number }> = [
      { x: 1, y: 1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: 0, y: 3 },
      { x: 3, y: 0 },
      { x: 0, y: 0 },
    ];
    const quadrants: ReadonlyArray<0 | 1 | 2 | 3 | 4> = [0, 1, 2, 3, 4];
    for (const p of points) {
      for (const q of quadrants) {
        expect(isInQuadrant(p, q)).toBe(quadrant(p) === q);
      }
    }
  });
});
