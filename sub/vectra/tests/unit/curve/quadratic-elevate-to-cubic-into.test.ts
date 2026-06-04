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
  return {
    p0: { x: 0, y: 0 },
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 0 },
    p3: { x: 0, y: 0 },
  };
}

describe('quadraticElevateToCubicInto', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 2 };
  const p2 = { x: 4, y: 0 };

  it('c0 = p0을 정확히 기록한다', () => {
    const out = makeOut();
    quadraticElevateToCubicInto(out, p0, p1, p2);
    expect(out.p0.x).toBe(p0.x);
    expect(out.p0.y).toBe(p0.y);
  });

  it('c3 = p2를 정확히 기록한다', () => {
    const out = makeOut();
    quadraticElevateToCubicInto(out, p0, p1, p2);
    expect(out.p3.x).toBe(p2.x);
    expect(out.p3.y).toBe(p2.y);
  });

  it('c1 = p0 + (2/3)*(p1 - p0) 수식 정확값이다', () => {
    const out = makeOut();
    quadraticElevateToCubicInto(out, p0, p1, p2);
    const expectedC1x = p0.x + (2 / 3) * (p1.x - p0.x);
    const expectedC1y = p0.y + (2 / 3) * (p1.y - p0.y);
    expect(relErr(out.p1.x, expectedC1x)).toBeLessThan(1e-12);
    expect(relErr(out.p1.y, expectedC1y)).toBeLessThan(1e-12);
  });

  it('c2 = p2 + (2/3)*(p1 - p2) 수식 정확값이다', () => {
    const out = makeOut();
    quadraticElevateToCubicInto(out, p0, p1, p2);
    const expectedC2x = p2.x + (2 / 3) * (p1.x - p2.x);
    const expectedC2y = p2.y + (2 / 3) * (p1.y - p2.y);
    expect(relErr(out.p2.x, expectedC2x)).toBeLessThan(1e-12);
    expect(relErr(out.p2.y, expectedC2y)).toBeLessThan(1e-12);
  });

  it('t=0에서 pointAt이 quadratic과 같다', () => {
    const out = makeOut();
    quadraticElevateToCubicInto(out, p0, p1, p2);
    const qPt = { x: 0, y: 0 };
    const cPt = { x: 0, y: 0 };
    quadraticPointAtTInto(qPt, p0, p1, p2, 0);
    cubicPointAtTInto(cPt, out.p0, out.p1, out.p2, out.p3, 0);
    expect(relErr(cPt.x, qPt.x)).toBeLessThan(1e-12);
    expect(relErr(cPt.y, qPt.y)).toBeLessThan(1e-12);
  });

  it('t=0.5에서 pointAt이 quadratic과 같다', () => {
    const out = makeOut();
    quadraticElevateToCubicInto(out, p0, p1, p2);
    const qPt = { x: 0, y: 0 };
    const cPt = { x: 0, y: 0 };
    quadraticPointAtTInto(qPt, p0, p1, p2, 0.5);
    cubicPointAtTInto(cPt, out.p0, out.p1, out.p2, out.p3, 0.5);
    expect(relErr(cPt.x, qPt.x)).toBeLessThan(1e-12);
    expect(relErr(cPt.y, qPt.y)).toBeLessThan(1e-12);
  });

  it('t=1에서 pointAt이 quadratic과 같다', () => {
    const out = makeOut();
    quadraticElevateToCubicInto(out, p0, p1, p2);
    const qPt = { x: 0, y: 0 };
    const cPt = { x: 0, y: 0 };
    quadraticPointAtTInto(qPt, p0, p1, p2, 1);
    cubicPointAtTInto(cPt, out.p0, out.p1, out.p2, out.p3, 1);
    expect(relErr(cPt.x, qPt.x)).toBeLessThan(1e-12);
    expect(relErr(cPt.y, qPt.y)).toBeLessThan(1e-12);
  });

  it('t=0.3에서 pointAt이 quadratic과 같다', () => {
    const out = makeOut();
    quadraticElevateToCubicInto(out, p0, p1, p2);
    const qPt = { x: 0, y: 0 };
    const cPt = { x: 0, y: 0 };
    quadraticPointAtTInto(qPt, p0, p1, p2, 0.3);
    cubicPointAtTInto(cPt, out.p0, out.p1, out.p2, out.p3, 0.3);
    expect(relErr(cPt.x, qPt.x)).toBeLessThan(1e-12);
    expect(relErr(cPt.y, qPt.y)).toBeLessThan(1e-12);
  });

  it('aliasing 안전: out.p0에 p0 object를 넣어도 정확하다', () => {
    // p0 aliasing: out.p0 === p0이더라도 c1 계산이 정확해야 한다
    const sharedP0 = { x: 0, y: 0 };
    const sharedOut = {
      p0: sharedP0, // aliasing
      p1: { x: 0, y: 0 },
      p2: { x: 0, y: 0 },
      p3: { x: 0, y: 0 },
    };
    quadraticElevateToCubicInto(sharedOut, sharedP0, p1, p2);
    const ref = makeOut();
    quadraticElevateToCubicInto(ref, { x: 0, y: 0 }, p1, p2);
    expect(relErr(sharedOut.p1.x, ref.p1.x)).toBeLessThan(1e-12);
    expect(relErr(sharedOut.p1.y, ref.p1.y)).toBeLessThan(1e-12);
    expect(relErr(sharedOut.p2.x, ref.p2.x)).toBeLessThan(1e-12);
    expect(relErr(sharedOut.p2.y, ref.p2.y)).toBeLessThan(1e-12);
  });

  it('out을 반환한다', () => {
    const out = makeOut();
    const ret = quadraticElevateToCubicInto(out, p0, p1, p2);
    expect(ret).toBe(out);
  });
});

describe('quadraticElevateToCubic', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 2 };
  const p2 = { x: 4, y: 0 };

  it('plain object { p0, p1, p2, p3 }를 반환한다', () => {
    const result = quadraticElevateToCubic(p0, p1, p2);
    expect(typeof result.p0.x).toBe('number');
    expect(typeof result.p1.y).toBe('number');
    expect(typeof result.p2.x).toBe('number');
    expect(typeof result.p3.y).toBe('number');
  });

  it('quadraticElevateToCubicInto와 같은 값을 반환한다', () => {
    const result = quadraticElevateToCubic(p0, p1, p2);
    const out = makeOut();
    quadraticElevateToCubicInto(out, p0, p1, p2);
    expect(relErr(result.p0.x, out.p0.x)).toBeLessThan(1e-12);
    expect(relErr(result.p1.x, out.p1.x)).toBeLessThan(1e-12);
    expect(relErr(result.p2.x, out.p2.x)).toBeLessThan(1e-12);
    expect(relErr(result.p3.x, out.p3.x)).toBeLessThan(1e-12);
  });
});
