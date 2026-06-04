/**
 * cubicLengthAtT unit test.
 *
 * 검증 방법:
 * - t=0은 0을 반환한다.
 * - t=1은 전체 length를 반환한다.
 * - t 범위 밖은 clamp된다.
 * - 직선 Bezier에서 length가 유클리드 거리와 일치한다.
 * - t 단조 증가 검증.
 */

import { describe, expect, it } from 'vitest';
import { cubicLength } from '../../../src/curve/cubic-length';
import { cubicLengthAtT } from '../../../src/curve/cubic-length-at-t';

function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

describe('cubicLengthAtT', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 3 };
  const p2 = { x: 3, y: 3 };
  const p3 = { x: 4, y: 0 };

  it('t=0이면 0을 반환한다', () => {
    expect(cubicLengthAtT(p0, p1, p2, p3, 0)).toBe(0);
  });

  it('t<0이면 0을 반환한다', () => {
    expect(cubicLengthAtT(p0, p1, p2, p3, -1)).toBe(0);
  });

  it('t=1이면 전체 length와 같다', () => {
    const total = cubicLength(p0, p1, p2, p3);
    const atT1 = cubicLengthAtT(p0, p1, p2, p3, 1);
    expect(relErr(atT1, total)).toBeLessThan(1e-10);
  });

  it('t>1이면 전체 length와 같다 (clamp)', () => {
    const total = cubicLength(p0, p1, p2, p3);
    const atT2 = cubicLengthAtT(p0, p1, p2, p3, 2);
    expect(relErr(atT2, total)).toBeLessThan(1e-10);
  });

  it('t가 증가하면 length도 단조 증가한다', () => {
    const ts = [0.1, 0.25, 0.5, 0.75, 0.9];
    let prev = 0;
    for (const t of ts) {
      const len = cubicLengthAtT(p0, p1, p2, p3, t);
      expect(len).toBeGreaterThan(prev);
      prev = len;
    }
  });

  it('직선 cubic Bezier에서 t=0.5의 length가 유클리드 거리 절반과 일치한다', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 10, y: 0 };
    // 직선: p0, p0 + 1/3*(p3-p0), p0 + 2/3*(p3-p0), p3
    const len = cubicLengthAtT(a, { x: 10 / 3, y: 0 }, { x: 20 / 3, y: 0 }, b, 0.5);
    expect(relErr(len, 5)).toBeLessThan(1e-6);
  });

  it('부분 length가 전체 length 사이에 있다', () => {
    const half = cubicLengthAtT(p0, p1, p2, p3, 0.5);
    const total = cubicLength(p0, p1, p2, p3);
    expect(half).toBeGreaterThan(0);
    expect(half).toBeLessThan(total);
  });

  it('tuple XYInput을 받는다', () => {
    const result = cubicLengthAtT([0, 0], [1, 3], [3, 3], [4, 0], 0.5);
    const ref = cubicLengthAtT(p0, p1, p2, p3, 0.5);
    expect(relErr(result, ref)).toBeLessThan(1e-12);
  });
});
