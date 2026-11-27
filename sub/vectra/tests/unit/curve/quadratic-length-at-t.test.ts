/**
 * quadraticLengthAtT의 부분 호 길이를 검증한다.
 * 직선 곡선은 유클리드 거리와 같다.
 * 일반 곡선은 0과 전체 길이 사이에 있다.
 * t clamp와 단조 증가는 speed-length.test.ts가 검증한다.
 */
import { flatQuadraticFromLegacyPoints } from '../../../src/internal/legacy-curve.internal';
import { describe, expect, it } from 'vitest';
import { quadraticLength } from '../../../src/curve/quadratic-length';
import { quadraticLengthAtT } from '../../../src/curve/quadratic-length-at-t';

/**
 * 기대값 대비 상대 오차를 구한다.
 * 기대값이 0이면 절대 오차를 돌려준다.
 */
function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

describe('quadraticLengthAtT', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 2 };
  const p2 = { x: 4, y: 0 };

  it('직선 Bezier에서 t=0.5의 length가 유클리드 거리 절반과 일치한다', () => {
    const a = { x: 0, y: 0 };
    const mid = { x: 5, y: 0 };
    const b = { x: 10, y: 0 };
    const len = quadraticLengthAtT(flatQuadraticFromLegacyPoints(a, mid, b), 0.5);
    expect(relErr(len, 5)).toBeLessThan(1e-6);
  });

  it('부분 length 합산이 전체 length와 같다 (LengthAtT additivity)', () => {
    const half = quadraticLengthAtT(flatQuadraticFromLegacyPoints(p0, p1, p2), 0.5);
    const total = quadraticLength(flatQuadraticFromLegacyPoints(p0, p1, p2));
    // t=0.5까지 길이는 전체의 0~100% 사이여야 한다
    expect(half).toBeGreaterThan(0);
    expect(half).toBeLessThan(total);
  });
});
