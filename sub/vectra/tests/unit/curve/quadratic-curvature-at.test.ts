/**
 * quadraticCurvatureAt unit test.
 *
 * 검증 방법:
 * - 직선 Bezier(collinear)는 curvature = 0.
 * - 일반 curve는 수식 (d1.x * d2.y - d1.y * d2.x) / |d1|^3 직접 계산값과 비교.
 * - degenerate (p0 == p1 == p2)는 0을 반환한다.
 */

import { describe, expect, it } from 'vitest';
import { quadraticCurvatureAt } from '../../../src/curve/quadratic-curvature-at';

// 상대 오차 비교 helper
function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

/**
 * 수식으로 quadratic curvature 기준값 계산.
 */
function refCurvature(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  t: number
): number {
  const twoMt = 2 * (1 - t);
  const twoT = 2 * t;
  const d1x = twoMt * (p1.x - p0.x) + twoT * (p2.x - p1.x);
  const d1y = twoMt * (p1.y - p0.y) + twoT * (p2.y - p1.y);
  const d2x = 2 * (p2.x - 2 * p1.x + p0.x);
  const d2y = 2 * (p2.y - 2 * p1.y + p0.y);
  const d1Sq = d1x * d1x + d1y * d1y;
  const d1Cubed = d1Sq * Math.sqrt(d1Sq);
  if (d1Cubed < 1e-10) return 0;
  return (d1x * d2y - d1y * d2x) / d1Cubed;
}

describe('quadraticCurvatureAt', () => {
  it('직선 curve에서 curvature = 0이다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 0 };
    const p2 = { x: 2, y: 0 };
    expect(quadraticCurvatureAt(p0, p1, p2, 0)).toBe(0);
    expect(quadraticCurvatureAt(p0, p1, p2, 0.5)).toBe(0);
    expect(quadraticCurvatureAt(p0, p1, p2, 1)).toBe(0);
  });

  it('대각선 직선 curve에서 curvature = 0이다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 1 };
    const p2 = { x: 2, y: 2 };
    expect(Math.abs(quadraticCurvatureAt(p0, p1, p2, 0.5))).toBeLessThan(1e-10);
  });

  it('degenerate curve (p0 == p1 == p2)에서 0을 반환한다', () => {
    const p = { x: 3, y: 3 };
    expect(quadraticCurvatureAt(p, p, p, 0.5)).toBe(0);
  });

  it('t=0.5에서 curvature가 수식 기준값과 같다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 2 };
    const p2 = { x: 4, y: 0 };
    const result = quadraticCurvatureAt(p0, p1, p2, 0.5);
    const ref = refCurvature(p0, p1, p2, 0.5);
    expect(relErr(result, ref)).toBeLessThan(1e-12);
  });

  it('t=0에서 curvature가 수식 기준값과 같다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 2 };
    const p2 = { x: 4, y: 0 };
    const result = quadraticCurvatureAt(p0, p1, p2, 0);
    const ref = refCurvature(p0, p1, p2, 0);
    expect(relErr(result, ref)).toBeLessThan(1e-12);
  });

  it('t=1에서 curvature가 수식 기준값과 같다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 2 };
    const p2 = { x: 4, y: 0 };
    const result = quadraticCurvatureAt(p0, p1, p2, 1);
    const ref = refCurvature(p0, p1, p2, 1);
    expect(relErr(result, ref)).toBeLessThan(1e-12);
  });

  it('부호가 cross product 방향과 일치한다', () => {
    // p1이 y 양수 방향(아래, screen coordinate): d1=(2,0), d2=(0,-4) → cross=d1.x*d2.y-d1.y*d2.x=-8 → 음수
    const p0a = { x: 0, y: 0 };
    const p1a = { x: 1, y: 1 };
    const p2a = { x: 2, y: 0 };
    expect(quadraticCurvatureAt(p0a, p1a, p2a, 0.5)).toBeLessThan(0);

    // p1이 y 음수 방향(위, screen coordinate): d1=(2,0), d2=(0,4) → cross=8 → 양수
    const p0b = { x: 0, y: 0 };
    const p1b = { x: 1, y: -1 };
    const p2b = { x: 2, y: 0 };
    expect(quadraticCurvatureAt(p0b, p1b, p2b, 0.5)).toBeGreaterThan(0);
  });

  it('tuple XYInput을 받는다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 2 };
    const p2 = { x: 4, y: 0 };
    const result = quadraticCurvatureAt([0, 0], [1, 2], [4, 0], 0.5);
    const ref = refCurvature(p0, p1, p2, 0.5);
    expect(relErr(result, ref)).toBeLessThan(1e-12);
  });

  it('number를 반환한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 2 };
    const p2 = { x: 4, y: 0 };
    const result = quadraticCurvatureAt(p0, p1, p2, 0.5);
    expect(typeof result).toBe('number');
  });
});
