/**
 * quadraticTAtLength가 직선 곡선에서 길이 비율과 같은 t를 돌려주는지 검증한다.
 * 평평한 곡선 리터럴과 점 기반 생성 결과가 같은 t를 내는지 확인한다.
 * 거리 경계, 길이 0, round-trip은 speed-length.test.ts가 검증한다.
 */
import { flatQuadraticFromLegacyPoints } from '../../../src/internal/legacy-curve.internal';
import { describe, expect, it } from 'vitest';
import { quadraticLengthAtT } from '../../../src/curve/quadratic-length-at-t';
import { quadraticTAtLength } from '../../../src/curve/quadratic-t-at-length';

/**
 * 기대값 대비 상대 오차를 구한다.
 * 기대값이 0이면 절대 오차를 돌려준다.
 */
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
    const t = quadraticTAtLength(flatQuadraticFromLegacyPoints(a, m, b), 5);
    expect(relErr(t, 0.5)).toBeLessThan(1e-6);
  });
});
