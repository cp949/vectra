/**
 * arcTAtLength unit test.
 *
 * 검증 방법:
 * - 단위 원 quarter arc에서 length=π/4이면 t≈0.5.
 * - degenerate/zero-sweep arc는 t=0을 반환한다.
 *
 * distance 경계, zero-length, 범위 [0, 1], round-trip 같은 일반 동작은 speed-length.test.ts가 검증한다.
 */

import { describe, expect, it } from 'vitest';
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
  it('단위 원에서 length=π/4이면 t≈0.5이다', () => {
    // quarter arc (π/2): 절반 length = π/4 → t = 0.5
    const t = arcTAtLength(quarterCircle, Math.PI / 4);
    expect(relErr(t, 0.5)).toBeLessThan(1e-6);
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
