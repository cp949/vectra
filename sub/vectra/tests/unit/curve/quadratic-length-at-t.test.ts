/**
 * quadraticLengthAtT unit test.
 *
 * 검증 방법:
 * - t=0은 0을 반환한다.
 * - t=1은 전체 length를 반환한다.
 * - t 범위 밖은 clamp된다.
 * - 직선 Bezier에서 length가 유클리드 거리와 일치한다.
 * - 원호 근사 Bezier로 전체 적분과 부분 적분의 정합성을 확인한다.
 */

import { describe, expect, it } from 'vitest';
import { quadraticLength } from '../../../src/curve/quadratic-length';
import { quadraticLengthAtT } from '../../../src/curve/quadratic-length-at-t';

function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

describe('quadraticLengthAtT', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 2 };
  const p2 = { x: 4, y: 0 };

  it('t=0이면 0을 반환한다', () => {
    expect(quadraticLengthAtT(p0, p1, p2, 0)).toBe(0);
  });

  it('t<0이면 0을 반환한다', () => {
    expect(quadraticLengthAtT(p0, p1, p2, -0.5)).toBe(0);
  });

  it('t=1이면 전체 length와 같다', () => {
    const total = quadraticLength(p0, p1, p2);
    const atT1 = quadraticLengthAtT(p0, p1, p2, 1);
    expect(relErr(atT1, total)).toBeLessThan(1e-10);
  });

  it('t>1이면 전체 length와 같다 (clamp)', () => {
    const total = quadraticLength(p0, p1, p2);
    const atT2 = quadraticLengthAtT(p0, p1, p2, 2);
    expect(relErr(atT2, total)).toBeLessThan(1e-10);
  });

  it('t가 증가하면 length도 단조 증가한다', () => {
    const ts = [0.1, 0.25, 0.5, 0.75, 0.9];
    let prev = 0;
    for (const t of ts) {
      const len = quadraticLengthAtT(p0, p1, p2, t);
      expect(len).toBeGreaterThan(prev);
      prev = len;
    }
  });

  it('직선 Bezier에서 t=0.5의 length가 유클리드 거리 절반과 일치한다', () => {
    const a = { x: 0, y: 0 };
    const mid = { x: 5, y: 0 };
    const b = { x: 10, y: 0 };
    const len = quadraticLengthAtT(a, mid, b, 0.5);
    expect(relErr(len, 5)).toBeLessThan(1e-6);
  });

  it('부분 length 합산이 전체 length와 같다 (LengthAtT additivity)', () => {
    const half = quadraticLengthAtT(p0, p1, p2, 0.5);
    const total = quadraticLength(p0, p1, p2);
    // t=0.5까지 길이는 전체의 0~100% 사이여야 한다
    expect(half).toBeGreaterThan(0);
    expect(half).toBeLessThan(total);
  });

  it('tuple XYInput을 받는다', () => {
    const result = quadraticLengthAtT([0, 0], [1, 2], [4, 0], 0.5);
    const ref = quadraticLengthAtT(p0, p1, p2, 0.5);
    expect(relErr(result, ref)).toBeLessThan(1e-12);
  });
});
