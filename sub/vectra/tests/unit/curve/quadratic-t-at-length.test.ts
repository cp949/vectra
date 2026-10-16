/**
 * quadraticTAtLength unit test.
 *
 * 검증 방법:
 * - 직선 Bezier에서 distance/totalLength ≈ t.
 * - tuple XYInput을 받는다.
 *
 * distance 경계, zero-length, 범위 [0, 1], round-trip 같은 일반 동작은 speed-length.test.ts가 검증한다.
 */

import { describe, expect, it } from 'vitest';
import { quadraticLengthAtT } from '../../../src/curve/quadratic-length-at-t';
import { quadraticTAtLength } from '../../../src/curve/quadratic-t-at-length';

function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

describe('quadraticTAtLength', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 2 };
  const p2 = { x: 4, y: 0 };

  it('직선 Bezier에서 distance/totalLength ≈ t이다', () => {
    const a = { x: 0, y: 0 };
    const m = { x: 5, y: 0 };
    const b = { x: 10, y: 0 };
    // 직선이므로 arc length = euclidean distance
    const t = quadraticTAtLength(a, m, b, 5);
    expect(relErr(t, 0.5)).toBeLessThan(1e-6);
  });

  it('tuple XYInput을 받는다', () => {
    const targetLen = quadraticLengthAtT(p0, p1, p2, 0.5);
    const result = quadraticTAtLength([0, 0], [1, 2], [4, 0], targetLen);
    const ref = quadraticTAtLength(p0, p1, p2, targetLen);
    expect(relErr(result, ref)).toBeLessThan(1e-12);
  });
});
