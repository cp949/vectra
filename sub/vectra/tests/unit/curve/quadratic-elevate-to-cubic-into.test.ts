import { flatQuadraticFromLegacyPoints, flatCubicFromLegacyPoints } from '../../../src/internal/legacy-curve.internal';
/**
 * quadraticElevateToCubicInto / quadraticElevateToCubic unit test.
 *
 * 검증 방법:
 * - 변환 후 cubic이 원본 quadratic과 모든 t에서 같은 pointAt 값을 반환한다.
 * - degree elevation 수식 정확값 직접 비교.
 */

import { describe, expect, it } from 'vitest';
import { cubicPointAtTInto } from '../../../src/curve/cubic-point-at-t-into';
import { quadraticElevateToCubic } from '../../../src/curve/quadratic-elevate-to-cubic';
import { quadraticElevateToCubicInto } from '../../../src/curve/quadratic-elevate-to-cubic-into';
import { quadraticPointAtTInto } from '../../../src/curve/quadratic-point-at-t-into';

// 상대 오차 비교 helper
function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

function makeOut() {
  return { kind: 'cubic' as const, x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 };
}

describe('quadraticElevateToCubicInto', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 2 };
  const p2 = { x: 4, y: 0 };

  it('c0 = p0을 정확히 기록한다', () => {
    const out = makeOut();
    quadraticElevateToCubicInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2));
    expect(out.x0).toBe(p0.x);
    expect(out.y0).toBe(p0.y);
  });

  it('c3 = p2를 정확히 기록한다', () => {
    const out = makeOut();
    quadraticElevateToCubicInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2));
    expect(out.x3).toBe(p2.x);
    expect(out.y3).toBe(p2.y);
  });

  it('c1 = p0 + (2/3)*(p1 - p0) 수식 정확값이다', () => {
    const out = makeOut();
    quadraticElevateToCubicInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2));
    const expectedC1x = p0.x + (2 / 3) * (p1.x - p0.x);
    const expectedC1y = p0.y + (2 / 3) * (p1.y - p0.y);
    expect(relErr(out.x1, expectedC1x)).toBeLessThan(1e-12);
    expect(relErr(out.y1, expectedC1y)).toBeLessThan(1e-12);
  });

  it('c2 = p2 + (2/3)*(p1 - p2) 수식 정확값이다', () => {
    const out = makeOut();
    quadraticElevateToCubicInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2));
    const expectedC2x = p2.x + (2 / 3) * (p1.x - p2.x);
    const expectedC2y = p2.y + (2 / 3) * (p1.y - p2.y);
    expect(relErr(out.x2, expectedC2x)).toBeLessThan(1e-12);
    expect(relErr(out.y2, expectedC2y)).toBeLessThan(1e-12);
  });

  it('t=0에서 pointAt이 quadratic과 같다', () => {
    const out = makeOut();
    quadraticElevateToCubicInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2));
    const qPt = { x: 0, y: 0 };
    const cPt = { x: 0, y: 0 };
    quadraticPointAtTInto(qPt, flatQuadraticFromLegacyPoints(p0, p1, p2), 0);
    cubicPointAtTInto(cPt, out, 0);
    expect(relErr(cPt.x, qPt.x)).toBeLessThan(1e-12);
    expect(relErr(cPt.y, qPt.y)).toBeLessThan(1e-12);
  });

  it('t=0.5에서 pointAt이 quadratic과 같다', () => {
    const out = makeOut();
    quadraticElevateToCubicInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2));
    const qPt = { x: 0, y: 0 };
    const cPt = { x: 0, y: 0 };
    quadraticPointAtTInto(qPt, flatQuadraticFromLegacyPoints(p0, p1, p2), 0.5);
    cubicPointAtTInto(cPt, out, 0.5);
    expect(relErr(cPt.x, qPt.x)).toBeLessThan(1e-12);
    expect(relErr(cPt.y, qPt.y)).toBeLessThan(1e-12);
  });

  it('t=1에서 pointAt이 quadratic과 같다', () => {
    const out = makeOut();
    quadraticElevateToCubicInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2));
    const qPt = { x: 0, y: 0 };
    const cPt = { x: 0, y: 0 };
    quadraticPointAtTInto(qPt, flatQuadraticFromLegacyPoints(p0, p1, p2), 1);
    cubicPointAtTInto(cPt, out, 1);
    expect(relErr(cPt.x, qPt.x)).toBeLessThan(1e-12);
    expect(relErr(cPt.y, qPt.y)).toBeLessThan(1e-12);
  });

  it('t=0.3에서 pointAt이 quadratic과 같다', () => {
    const out = makeOut();
    quadraticElevateToCubicInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2));
    const qPt = { x: 0, y: 0 };
    const cPt = { x: 0, y: 0 };
    quadraticPointAtTInto(qPt, flatQuadraticFromLegacyPoints(p0, p1, p2), 0.3);
    cubicPointAtTInto(cPt, out, 0.3);
    expect(relErr(cPt.x, qPt.x)).toBeLessThan(1e-12);
    expect(relErr(cPt.y, qPt.y)).toBeLessThan(1e-12);
  });

  it('out을 반환한다', () => {
    const out = makeOut();
    const ret = quadraticElevateToCubicInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2));
    expect(ret).toBe(out);
  });
});

describe('quadraticElevateToCubic', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 2 };
  const p2 = { x: 4, y: 0 };

  it('plain object { p0, p1, p2, p3 }를 반환한다', () => {
    const result = quadraticElevateToCubic(flatQuadraticFromLegacyPoints(p0, p1, p2));
    expect(typeof result.x0).toBe('number');
    expect(typeof result.y1).toBe('number');
    expect(typeof result.x2).toBe('number');
    expect(typeof result.y3).toBe('number');
  });

  it('quadraticElevateToCubicInto와 같은 값을 반환한다', () => {
    const result = quadraticElevateToCubic(flatQuadraticFromLegacyPoints(p0, p1, p2));
    const out = makeOut();
    quadraticElevateToCubicInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2));
    expect(relErr(result.x0, out.x0)).toBeLessThan(1e-12);
    expect(relErr(result.x1, out.x1)).toBeLessThan(1e-12);
    expect(relErr(result.x2, out.x2)).toBeLessThan(1e-12);
    expect(relErr(result.x3, out.x3)).toBeLessThan(1e-12);
  });
});
