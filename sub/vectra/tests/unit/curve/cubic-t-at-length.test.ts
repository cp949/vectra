/**
 * cubicTAtLength unit test.
 *
 * 검증 방법:
 * - 역함수 round-trip: LengthAtT(TAtLength(len)) ≈ len.
 * - distance=0은 t=0을 반환한다.
 * - distance>=totalLength는 t=1을 반환한다.
 * - zero-length curve는 t=0을 반환한다.
 * - 직선 cubic Bezier에서 distance/totalLength ≈ t.
 */

import { describe, expect, it } from 'vitest';
import { cubicLengthAtT } from '../../../src/curve/cubic-length-at-t';
import { cubicTAtLength } from '../../../src/curve/cubic-t-at-length';

function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

describe('cubicTAtLength', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 3 };
  const p2 = { x: 3, y: 3 };
  const p3 = { x: 4, y: 0 };

  it('distance=0이면 t=0을 반환한다', () => {
    expect(cubicTAtLength(p0, p1, p2, p3, 0)).toBe(0);
  });

  it('distance<0이면 t=0을 반환한다', () => {
    expect(cubicTAtLength(p0, p1, p2, p3, -1)).toBe(0);
  });

  it('distance가 totalLength 이상이면 t=1을 반환한다', () => {
    const total = cubicLengthAtT(p0, p1, p2, p3, 1);
    expect(cubicTAtLength(p0, p1, p2, p3, total)).toBe(1);
    expect(cubicTAtLength(p0, p1, p2, p3, total * 2)).toBe(1);
  });

  it('zero-length curve에서는 양수 distance도 t=0으로 clamp한다', () => {
    const p = { x: 2, y: 3 };
    expect(cubicTAtLength(p, p, p, p, 1)).toBe(0);
  });

  it('round-trip: LengthAtT(TAtLength(len)) ≈ len', () => {
    for (const t of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      const targetLen = cubicLengthAtT(p0, p1, p2, p3, t);
      const recovered = cubicTAtLength(p0, p1, p2, p3, targetLen);
      const recoveredLen = cubicLengthAtT(p0, p1, p2, p3, recovered);
      expect(relErr(recoveredLen, targetLen)).toBeLessThan(1e-6);
    }
  });

  it('직선 cubic Bezier에서 distance/totalLength ≈ t이다', () => {
    const a = { x: 0, y: 0 };
    const b1 = { x: 10 / 3, y: 0 };
    const b2 = { x: 20 / 3, y: 0 };
    const b = { x: 10, y: 0 };
    const t = cubicTAtLength(a, b1, b2, b, 5);
    expect(relErr(t, 0.5)).toBeLessThan(1e-6);
  });

  it('반환 t가 [0, 1] 범위 안에 있다', () => {
    for (const dist of [0, 1, 2, 5, 100]) {
      const t = cubicTAtLength(p0, p1, p2, p3, dist);
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(1);
    }
  });

  it('tuple XYInput을 받는다', () => {
    const targetLen = cubicLengthAtT(p0, p1, p2, p3, 0.5);
    const result = cubicTAtLength([0, 0], [1, 3], [3, 3], [4, 0], targetLen);
    const ref = cubicTAtLength(p0, p1, p2, p3, targetLen);
    expect(relErr(result, ref)).toBeLessThan(1e-12);
  });
});
