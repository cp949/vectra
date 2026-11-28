/**
 * cubicLengthAtT의 부분 호 길이를 검증한다.
 * 직선 곡선은 유클리드 거리와 같다.
 * 일반 곡선은 0과 전체 길이 사이에 있다.
 * t clamp와 단조 증가는 speed-length.test.ts가 검증한다.
 */
import { describe, expect, it } from 'vitest';
import { cubicLength } from '../../../src/curve/cubic-length';
import { cubicLengthAtT } from '../../../src/curve/cubic-length-at-t';
import { flatCubicFromLegacyPoints } from '../_helpers/curve-fixtures';

/**
 * 기대값 대비 상대 오차를 구한다.
 * 기대값이 0이면 절대 오차를 돌려준다.
 */
function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

describe('cubicLengthAtT', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 3 };
  const p2 = { x: 3, y: 3 };
  const p3 = { x: 4, y: 0 };

  it('직선 cubic Bezier에서 t=0.5의 length가 유클리드 거리 절반과 일치한다', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 10, y: 0 };
    // 직선: p0, p0 + 1/3*(p3-p0), p0 + 2/3*(p3-p0), p3
    const len = cubicLengthAtT(flatCubicFromLegacyPoints(a, { x: 10 / 3, y: 0 }, { x: 20 / 3, y: 0 }, b), 0.5);
    expect(relErr(len, 5)).toBeLessThan(1e-6);
  });

  it('부분 length가 전체 length 사이에 있다', () => {
    const half = cubicLengthAtT(flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    const total = cubicLength(flatCubicFromLegacyPoints(p0, p1, p2, p3));
    expect(half).toBeGreaterThan(0);
    expect(half).toBeLessThan(total);
  });
});
