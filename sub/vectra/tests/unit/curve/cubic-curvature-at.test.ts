/**
 * cubicCurvatureAt unit test.
 *
 * 검증 방법:
 * - 직선 Bezier(collinear)는 curvature = 0.
 * - 일반 curve는 수식 (d1.x * d2.y - d1.y * d2.x) / |d1|^3 직접 계산값과 비교.
 * - degenerate (p0 == p1 == p2 == p3)는 0을 반환한다.
 */

import { describe, expect, it } from 'vitest';
import { cubicCurvatureAt } from '../../../src/curve/cubic-curvature-at';

// 상대 오차 비교 helper
function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

/**
 * 수식으로 cubic curvature 기준값 계산.
 */
function refCurvature(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
): number {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  const twoMtT = 2 * mt * t;
  const d1x = 3 * (mt2 * (p1.x - p0.x) + twoMtT * (p2.x - p1.x) + t2 * (p3.x - p2.x));
  const d1y = 3 * (mt2 * (p1.y - p0.y) + twoMtT * (p2.y - p1.y) + t2 * (p3.y - p2.y));
  const d2x = 6 * (mt * (p2.x - 2 * p1.x + p0.x) + t * (p3.x - 2 * p2.x + p1.x));
  const d2y = 6 * (mt * (p2.y - 2 * p1.y + p0.y) + t * (p3.y - 2 * p2.y + p1.y));
  const d1Sq = d1x * d1x + d1y * d1y;
  const d1Cubed = d1Sq * Math.sqrt(d1Sq);
  if (d1Cubed < 1e-10) return 0;
  return (d1x * d2y - d1y * d2x) / d1Cubed;
}

describe('cubicCurvatureAt', () => {
  it('직선 curve에서 curvature = 0이다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 0 };
    const p2 = { x: 2, y: 0 };
    const p3 = { x: 3, y: 0 };
    expect(cubicCurvatureAt(p0, p1, p2, p3, 0)).toBe(0);
    expect(cubicCurvatureAt(p0, p1, p2, p3, 0.5)).toBe(0);
    expect(cubicCurvatureAt(p0, p1, p2, p3, 1)).toBe(0);
  });

  it('대각선 직선 curve에서 curvature = 0이다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 1 };
    const p2 = { x: 2, y: 2 };
    const p3 = { x: 3, y: 3 };
    expect(Math.abs(cubicCurvatureAt(p0, p1, p2, p3, 0.5))).toBeLessThan(1e-10);
  });

  it('degenerate curve (p0 == p1 == p2 == p3)에서 0을 반환한다', () => {
    const p = { x: 3, y: 3 };
    expect(cubicCurvatureAt(p, p, p, p, 0.5)).toBe(0);
  });

  it('t=0.5에서 curvature가 수식 기준값과 같다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 3 };
    const p2 = { x: 3, y: 3 };
    const p3 = { x: 4, y: 0 };
    const result = cubicCurvatureAt(p0, p1, p2, p3, 0.5);
    const ref = refCurvature(p0, p1, p2, p3, 0.5);
    expect(relErr(result, ref)).toBeLessThan(1e-12);
  });

  it('t=0에서 curvature가 수식 기준값과 같다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 3 };
    const p2 = { x: 3, y: 3 };
    const p3 = { x: 4, y: 0 };
    const result = cubicCurvatureAt(p0, p1, p2, p3, 0);
    const ref = refCurvature(p0, p1, p2, p3, 0);
    expect(relErr(result, ref)).toBeLessThan(1e-12);
  });

  it('t=1에서 curvature가 수식 기준값과 같다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 3 };
    const p2 = { x: 3, y: 3 };
    const p3 = { x: 4, y: 0 };
    const result = cubicCurvatureAt(p0, p1, p2, p3, 1);
    const ref = refCurvature(p0, p1, p2, p3, 1);
    expect(relErr(result, ref)).toBeLessThan(1e-12);
  });

  it('t=0.3에서 curvature가 수식 기준값과 같다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 3 };
    const p2 = { x: 3, y: 3 };
    const p3 = { x: 4, y: 0 };
    const result = cubicCurvatureAt(p0, p1, p2, p3, 0.3);
    const ref = refCurvature(p0, p1, p2, p3, 0.3);
    expect(relErr(result, ref)).toBeLessThan(1e-12);
  });

  it('부호가 cross product 방향과 일치한다', () => {
    // p1, p2가 y 양수 방향(screen 아래): curvature 음수
    const p0a = { x: 0, y: 0 };
    const p1a = { x: 1, y: 2 };
    const p2a = { x: 3, y: 2 };
    const p3a = { x: 4, y: 0 };
    expect(cubicCurvatureAt(p0a, p1a, p2a, p3a, 0.5)).toBeLessThan(0);

    // p1, p2가 y 음수 방향(screen 위): curvature 양수
    const p0b = { x: 0, y: 0 };
    const p1b = { x: 1, y: -2 };
    const p2b = { x: 3, y: -2 };
    const p3b = { x: 4, y: 0 };
    expect(cubicCurvatureAt(p0b, p1b, p2b, p3b, 0.5)).toBeGreaterThan(0);
  });

  it('tuple XYInput을 받는다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 3 };
    const p2 = { x: 3, y: 3 };
    const p3 = { x: 4, y: 0 };
    const result = cubicCurvatureAt([0, 0], [1, 3], [3, 3], [4, 0], 0.5);
    const ref = refCurvature(p0, p1, p2, p3, 0.5);
    expect(relErr(result, ref)).toBeLessThan(1e-12);
  });

  it('number를 반환한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 3 };
    const p2 = { x: 3, y: 3 };
    const p3 = { x: 4, y: 0 };
    const result = cubicCurvatureAt(p0, p1, p2, p3, 0.5);
    expect(typeof result).toBe('number');
  });
});
