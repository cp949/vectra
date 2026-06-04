/**
 * quadraticTAtLength unit test.
 *
 * 검증 방법:
 * - 역함수 round-trip: TAtLength(LengthAtT(t)) ≈ t.
 * - distance=0은 t=0을 반환한다.
 * - distance>=totalLength는 t=1을 반환한다.
 * - zero-length curve는 t=0을 반환한다.
 * - 직선 Bezier에서 distance/totalLength ≈ t.
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

  it('distance=0이면 t=0을 반환한다', () => {
    expect(quadraticTAtLength(p0, p1, p2, 0)).toBe(0);
  });

  it('distance<0이면 t=0을 반환한다', () => {
    expect(quadraticTAtLength(p0, p1, p2, -1)).toBe(0);
  });

  it('distance가 totalLength 이상이면 t=1을 반환한다', () => {
    const total = quadraticLengthAtT(p0, p1, p2, 1);
    expect(quadraticTAtLength(p0, p1, p2, total)).toBe(1);
    expect(quadraticTAtLength(p0, p1, p2, total * 2)).toBe(1);
  });

  it('zero-length curve에서는 양수 distance도 t=0으로 clamp한다', () => {
    const p = { x: 2, y: 3 };
    expect(quadraticTAtLength(p, p, p, 1)).toBe(0);
  });

  it('round-trip: LengthAtT(TAtLength(t)) ≈ t 기준 length', () => {
    for (const t of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      const targetLen = quadraticLengthAtT(p0, p1, p2, t);
      const recovered = quadraticTAtLength(p0, p1, p2, targetLen);
      const recoveredLen = quadraticLengthAtT(p0, p1, p2, recovered);
      expect(relErr(recoveredLen, targetLen)).toBeLessThan(1e-6);
    }
  });

  it('직선 Bezier에서 distance/totalLength ≈ t이다', () => {
    const a = { x: 0, y: 0 };
    const m = { x: 5, y: 0 };
    const b = { x: 10, y: 0 };
    // 직선이므로 arc length = euclidean distance
    const t = quadraticTAtLength(a, m, b, 5);
    expect(relErr(t, 0.5)).toBeLessThan(1e-6);
  });

  it('반환 t가 [0, 1] 범위 안에 있다', () => {
    for (const dist of [0, 1, 2, 3, 100]) {
      const t = quadraticTAtLength(p0, p1, p2, dist);
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(1);
    }
  });

  it('tuple XYInput을 받는다', () => {
    const targetLen = quadraticLengthAtT(p0, p1, p2, 0.5);
    const result = quadraticTAtLength([0, 0], [1, 2], [4, 0], targetLen);
    const ref = quadraticTAtLength(p0, p1, p2, targetLen);
    expect(relErr(result, ref)).toBeLessThan(1e-12);
  });
});
