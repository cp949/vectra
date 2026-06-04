import { describe, expect, test } from 'vitest';
import { containsPoint } from '../../../src/capsule/contains-point';
import { distanceToPoint } from '../../../src/capsule/distance-to-point';
import type { CapsuleLike } from '../../../src/types';

// a=(0,0), b=(10,0), r=2 인 수평 capsule
const horizontal: CapsuleLike = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, radius: 2 };
// zero-axis capsule = center (0,0), radius 5 circle
const zeroAxis: CapsuleLike = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 }, radius: 5 };

// ─── containsPoint ──────────────────────────────────────────────────────────────

describe('containsPoint - side region', () => {
  test('side 내부 point는 true', () => {
    expect(containsPoint(horizontal, { x: 5, y: 1 })).toBe(true);
  });

  test('side boundary point(distance === radius)는 true', () => {
    expect(containsPoint(horizontal, { x: 5, y: 2 })).toBe(true);
  });

  test('side 외부 point는 false', () => {
    expect(containsPoint(horizontal, { x: 5, y: 5 })).toBe(false);
  });

  test('axis 위 point는 true', () => {
    expect(containsPoint(horizontal, { x: 5, y: 0 })).toBe(true);
  });
});

describe('containsPoint - endpoint cap', () => {
  test('endpoint cap 내부 point는 true', () => {
    expect(containsPoint(horizontal, { x: -1, y: 0 })).toBe(true);
  });

  test('endpoint cap boundary point는 true', () => {
    expect(containsPoint(horizontal, { x: -2, y: 0 })).toBe(true);
  });

  test('endpoint cap 외부 point는 false', () => {
    expect(containsPoint(horizontal, { x: -3, y: 0 })).toBe(false);
  });
});

describe('containsPoint - zero-axis', () => {
  test('내부 point는 true', () => {
    expect(containsPoint(zeroAxis, { x: 3, y: 0 })).toBe(true);
  });

  test('boundary point는 true', () => {
    expect(containsPoint(zeroAxis, { x: 5, y: 0 })).toBe(true);
  });

  test('외부 point는 false', () => {
    expect(containsPoint(zeroAxis, { x: 8, y: 0 })).toBe(false);
  });

  test('finite axis distance 제곱이 overflow해도 false를 반환한다', () => {
    expect(containsPoint({ a: { x: 0, y: 0 }, b: { x: 0, y: 0 }, radius: 1 }, { x: Number.MAX_VALUE / 2, y: 0 })).toBe(
      false
    );
  });
});

describe('containsPoint - input 형태', () => {
  test('tuple input에서도 동작한다', () => {
    const capsule = [[0, 0], [10, 0], 2] as const;
    expect(containsPoint(capsule, [5, 1])).toBe(true);
    expect(containsPoint(capsule, [5, 5])).toBe(false);
  });
});

describe('containsPoint - invalid radius', () => {
  test.each([-1, NaN, Infinity, -Infinity])('radius %s는 RangeError', (radius) => {
    expect(() => containsPoint({ a: { x: 0, y: 0 }, b: { x: 1, y: 0 }, radius }, { x: 0, y: 0 })).toThrow(RangeError);
  });
});

// ─── distanceToPoint ──────────────────────────────────────────────────────────────

describe('distanceToPoint - 내부/boundary는 0', () => {
  test('side 내부 point는 0', () => {
    expect(distanceToPoint(horizontal, { x: 5, y: 1 })).toBe(0);
  });

  test('side boundary point는 0', () => {
    expect(distanceToPoint(horizontal, { x: 5, y: 2 })).toBe(0);
  });

  test('axis 위 point는 0', () => {
    expect(distanceToPoint(horizontal, { x: 5, y: 0 })).toBe(0);
  });

  test('endpoint cap boundary point는 0', () => {
    expect(distanceToPoint(horizontal, { x: -2, y: 0 })).toBe(0);
  });
});

describe('distanceToPoint - 외부 unsigned distance', () => {
  test('side 외부 point는 axis 거리에서 radius를 뺀 값', () => {
    // dist to axis = 5, radius 2 → 3
    expect(distanceToPoint(horizontal, { x: 5, y: 5 })).toBeCloseTo(3, 10);
  });

  test('endpoint cap 외부 point는 cap 거리에서 radius를 뺀 값', () => {
    // closest axis point (0,0), dist 3, radius 2 → 1
    expect(distanceToPoint(horizontal, { x: -3, y: 0 })).toBeCloseTo(1, 10);
  });

  test('대각선 외부 point의 거리를 계산한다', () => {
    // a=(0,0) cap, point (3,4): dist to (0,0) = 5, radius 2 → 3
    expect(distanceToPoint(horizontal, { x: -3, y: 4 })).toBeCloseTo(3, 10);
  });
});

describe('distanceToPoint - zero-axis', () => {
  test('내부 point는 0', () => {
    expect(distanceToPoint(zeroAxis, { x: 3, y: 0 })).toBe(0);
  });

  test('boundary point는 0', () => {
    expect(distanceToPoint(zeroAxis, { x: 5, y: 0 })).toBe(0);
  });

  test('외부 point는 circle 거리와 같다', () => {
    // dist 8, radius 5 → 3
    expect(distanceToPoint(zeroAxis, { x: 8, y: 0 })).toBeCloseTo(3, 10);
  });

  test('finite axis distance 제곱이 overflow해도 unsigned distance는 finite distance를 유지한다', () => {
    const far = Number.MAX_VALUE / 2;
    expect(distanceToPoint({ a: { x: 0, y: 0 }, b: { x: 0, y: 0 }, radius: 1 }, { x: far, y: 0 })).toBe(far);
  });
});

describe('distanceToPoint - input 형태', () => {
  test('tuple input에서도 동작한다', () => {
    const capsule = [[0, 0], [10, 0], 2] as const;
    expect(distanceToPoint(capsule, [5, 5])).toBeCloseTo(3, 10);
  });
});

describe('distanceToPoint - invalid radius', () => {
  test.each([-1, NaN, Infinity, -Infinity])('radius %s는 RangeError', (radius) => {
    expect(() => distanceToPoint({ a: { x: 0, y: 0 }, b: { x: 1, y: 0 }, radius }, { x: 0, y: 0 })).toThrow(RangeError);
  });
});
