/**
 * arcTAtLength unit test.
 *
 * 검증 방법:
 * - 역함수 round-trip: LengthAtT(TAtLength(len)) ≈ len.
 * - distance=0은 t=0을 반환한다.
 * - distance>=totalLength는 t=1을 반환한다.
 * - 단위 원 quarter arc에서 균등 분할 t와 일치한다.
 * - degenerate arc는 0을 반환한다.
 */

import { describe, expect, it } from 'vitest';
import { arcLengthAtT } from '../../../src/curve/arc-length-at-t';
import { arcTAtLength } from '../../../src/curve/arc-t-at-length';
import type { CenterArcLike } from '../../../src/types';

function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

const quarterCircle: CenterArcLike = {
  cx: 0,
  cy: 0,
  rx: 1,
  ry: 1,
  xRotation: 0,
  startAngle: 0,
  endAngle: Math.PI / 2,
  sweep: true,
};

describe('arcTAtLength', () => {
  it('distance=0이면 t=0을 반환한다', () => {
    expect(arcTAtLength(quarterCircle, 0)).toBe(0);
  });

  it('distance<0이면 t=0을 반환한다', () => {
    expect(arcTAtLength(quarterCircle, -1)).toBe(0);
  });

  it('distance>=totalLength이면 t=1을 반환한다', () => {
    const total = arcLengthAtT(quarterCircle, 1);
    expect(arcTAtLength(quarterCircle, total)).toBe(1);
    expect(arcTAtLength(quarterCircle, total * 2)).toBe(1);
  });

  it('round-trip: LengthAtT(TAtLength(len)) ≈ len', () => {
    for (const t of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      const targetLen = arcLengthAtT(quarterCircle, t);
      const recovered = arcTAtLength(quarterCircle, targetLen);
      const recoveredLen = arcLengthAtT(quarterCircle, recovered);
      expect(relErr(recoveredLen, targetLen)).toBeLessThan(1e-6);
    }
  });

  it('단위 원에서 length=π/4이면 t≈0.5이다', () => {
    // quarter arc (π/2): 절반 length = π/4 → t = 0.5
    const t = arcTAtLength(quarterCircle, Math.PI / 4);
    expect(relErr(t, 0.5)).toBeLessThan(1e-6);
  });

  it('반환 t가 [0, 1] 범위 안에 있다', () => {
    for (const dist of [0, 0.5, 1, 2, 100]) {
      const t = arcTAtLength(quarterCircle, dist);
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(1);
    }
  });

  it('degenerate (rx=0) arc는 t=0을 반환한다', () => {
    const degenerate: CenterArcLike = {
      cx: 0,
      cy: 0,
      rx: 0,
      ry: 1,
      xRotation: 0,
      startAngle: 0,
      endAngle: Math.PI,
      sweep: true,
    };
    expect(arcTAtLength(degenerate, 0.5)).toBe(0);
  });

  it('zero-sweep arc는 t=0을 반환한다', () => {
    const zeroSweep: CenterArcLike = {
      cx: 0,
      cy: 0,
      rx: 1,
      ry: 1,
      xRotation: 0,
      startAngle: 0,
      endAngle: 0,
      sweep: true,
    };
    expect(arcTAtLength(zeroSweep, 1)).toBe(0);
  });
});
