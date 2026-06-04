/**
 * arcLengthAtT unit test.
 *
 * 검증 방법:
 * - t=0은 0을 반환한다.
 * - t=1은 전체 length와 같다.
 * - 단위 원 quarter arc에서 arc length가 r * Δθ와 일치한다.
 * - degenerate/zero-sweep arc는 0을 반환한다.
 * - t 범위 밖은 clamp된다.
 */

import { describe, expect, it } from 'vitest';
import { arcLength } from '../../../src/curve/arc-length';
import { arcLengthAtT } from '../../../src/curve/arc-length-at-t';
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

describe('arcLengthAtT', () => {
  it('t=0이면 0을 반환한다', () => {
    expect(arcLengthAtT(quarterCircle, 0)).toBe(0);
  });

  it('t<0이면 0을 반환한다', () => {
    expect(arcLengthAtT(quarterCircle, -1)).toBe(0);
  });

  it('t=1이면 전체 length와 같다', () => {
    const total = arcLength(quarterCircle);
    const atT1 = arcLengthAtT(quarterCircle, 1);
    expect(relErr(atT1, total)).toBeLessThan(1e-6);
  });

  it('t>1이면 전체 length와 같다 (clamp)', () => {
    const total = arcLength(quarterCircle);
    const atT2 = arcLengthAtT(quarterCircle, 2);
    expect(relErr(atT2, total)).toBeLessThan(1e-6);
  });

  it('단위 원에서 t=0.5의 length가 (π/4)에 근사한다', () => {
    // quarter arc (0 ~ π/2): t=0.5 → θ = π/4 → length = π/4
    const len = arcLengthAtT(quarterCircle, 0.5);
    expect(relErr(len, Math.PI / 4)).toBeLessThan(1e-6);
  });

  it('t가 증가하면 length도 단조 증가한다', () => {
    const ts = [0.1, 0.25, 0.5, 0.75, 0.9];
    let prev = 0;
    for (const t of ts) {
      const len = arcLengthAtT(quarterCircle, t);
      expect(len).toBeGreaterThan(prev);
      prev = len;
    }
  });

  it('degenerate (rx=0) arc는 0을 반환한다', () => {
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
    expect(arcLengthAtT(degenerate, 0.5)).toBe(0);
  });

  it('zero-sweep arc는 0을 반환한다', () => {
    const zeroSweep: CenterArcLike = {
      cx: 0,
      cy: 0,
      rx: 1,
      ry: 1,
      xRotation: 0,
      startAngle: Math.PI / 4,
      endAngle: Math.PI / 4,
      sweep: true,
    };
    expect(arcLengthAtT(zeroSweep, 0.5)).toBe(0);
  });

  it('r=5 반원에서 t=1 length가 5π에 근사한다', () => {
    const halfCircle: CenterArcLike = {
      cx: 0,
      cy: 0,
      rx: 5,
      ry: 5,
      xRotation: 0,
      startAngle: 0,
      endAngle: Math.PI,
      sweep: true,
    };
    const len = arcLengthAtT(halfCircle, 1);
    expect(relErr(len, 5 * Math.PI)).toBeLessThan(1e-6);
  });
});
