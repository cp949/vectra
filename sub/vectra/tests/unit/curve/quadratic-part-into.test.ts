import { flatQuadraticFromLegacyPoints } from '../../../src/internal/legacy-curve.internal';
/**
 * quadraticPartInto / quadraticPart unit test.
 *
 * 기준값: quadraticSplitInto 두 번 적용 결과와 비교.
 * - fromT에서 split하여 right를 얻고, 그 right에서 t2에서 left를 얻는다.
 * - 역방향 구간은 quadraticPointAtTInto(fromT)에서 시작해 quadraticPointAtTInto(toT)에서 끝난다.
 */

import { describe, expect, it } from 'vitest';
import { quadraticPart } from '../../../src/curve/quadratic-part';
import { quadraticPartInto } from '../../../src/curve/quadratic-part-into';
import { quadraticPointAtTInto } from '../../../src/curve/quadratic-point-at-t-into';
import { quadraticSplitInto } from '../../../src/curve/quadratic-split-into';

// 상대 오차 비교 helper
function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

function makeOut() {
  return { kind: 'quadratic' as const, x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
}

/**
 * splitInto 두 번으로 기준값 계산: [fromT, toT] subcurve.
 */
function refSubcurve(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  fromT: number,
  toT: number
) {
  if (fromT === 0) {
    const left = makeOut();
    const right = makeOut();
    quadraticSplitInto(left, right, flatQuadraticFromLegacyPoints(p0, p1, p2), toT);
    return left;
  }
  if (toT === 1) {
    const left = makeOut();
    const right = makeOut();
    quadraticSplitInto(left, right, flatQuadraticFromLegacyPoints(p0, p1, p2), fromT);
    return right;
  }
  // 일반: step1 right → step2 left
  const left1 = makeOut();
  const right1 = makeOut();
  quadraticSplitInto(left1, right1, flatQuadraticFromLegacyPoints(p0, p1, p2), fromT);
  const t2 = (toT - fromT) / (1 - fromT);
  const left2 = makeOut();
  const right2 = makeOut();
  quadraticSplitInto(left2, right2, right1, t2);
  return left2;
}

describe('quadraticPartInto', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 2 };
  const p2 = { x: 4, y: 0 };

  it('[0, 1] 구간은 원본 curve와 동일하다', () => {
    const out = makeOut();
    quadraticPartInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2), 0, 1);
    expect(relErr(out.x0, 0)).toBeLessThan(1e-12);
    expect(relErr(out.y0, 0)).toBeLessThan(1e-12);
    expect(relErr(out.x1, 1)).toBeLessThan(1e-12);
    expect(relErr(out.y1, 2)).toBeLessThan(1e-12);
    expect(relErr(out.x2, 4)).toBeLessThan(1e-12);
    expect(relErr(out.y2, 0)).toBeLessThan(1e-12);
  });

  it('[0, 0.5] 구간은 splitInto left와 같다', () => {
    const out = makeOut();
    quadraticPartInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2), 0, 0.5);
    const ref = refSubcurve(p0, p1, p2, 0, 0.5);
    expect(relErr(out.x0, ref.x0)).toBeLessThan(1e-12);
    expect(relErr(out.y0, ref.y0)).toBeLessThan(1e-12);
    expect(relErr(out.x1, ref.x1)).toBeLessThan(1e-12);
    expect(relErr(out.y1, ref.y1)).toBeLessThan(1e-12);
    expect(relErr(out.x2, ref.x2)).toBeLessThan(1e-12);
    expect(relErr(out.y2, ref.y2)).toBeLessThan(1e-12);
  });

  it('[0.5, 1] 구간은 splitInto right와 같다', () => {
    const out = makeOut();
    quadraticPartInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2), 0.5, 1);
    const ref = refSubcurve(p0, p1, p2, 0.5, 1);
    expect(relErr(out.x0, ref.x0)).toBeLessThan(1e-12);
    expect(relErr(out.y0, ref.y0)).toBeLessThan(1e-12);
    expect(relErr(out.x1, ref.x1)).toBeLessThan(1e-12);
    expect(relErr(out.y1, ref.y1)).toBeLessThan(1e-12);
    expect(relErr(out.x2, ref.x2)).toBeLessThan(1e-12);
    expect(relErr(out.y2, ref.y2)).toBeLessThan(1e-12);
  });

  it('[0.25, 0.75] 구간은 split 두 번 결과와 같다', () => {
    const out = makeOut();
    quadraticPartInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2), 0.25, 0.75);
    const ref = refSubcurve(p0, p1, p2, 0.25, 0.75);
    expect(relErr(out.x0, ref.x0)).toBeLessThan(1e-12);
    expect(relErr(out.y0, ref.y0)).toBeLessThan(1e-12);
    expect(relErr(out.x1, ref.x1)).toBeLessThan(1e-12);
    expect(relErr(out.y1, ref.y1)).toBeLessThan(1e-12);
    expect(relErr(out.x2, ref.x2)).toBeLessThan(1e-12);
    expect(relErr(out.y2, ref.y2)).toBeLessThan(1e-12);
  });

  it('subcurve의 p0은 원본 curve quadraticPointAtTInto(fromT)와 같다', () => {
    const out = makeOut();
    quadraticPartInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2), 0.3, 0.7);
    const pt = { x: 0, y: 0 };
    quadraticPointAtTInto(pt, flatQuadraticFromLegacyPoints(p0, p1, p2), 0.3);
    expect(relErr(out.x0, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out.y0, pt.y)).toBeLessThan(1e-12);
  });

  it('subcurve의 p2는 원본 curve quadraticPointAtTInto(toT)와 같다', () => {
    const out = makeOut();
    quadraticPartInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2), 0.3, 0.7);
    const pt = { x: 0, y: 0 };
    quadraticPointAtTInto(pt, flatQuadraticFromLegacyPoints(p0, p1, p2), 0.7);
    expect(relErr(out.x2, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out.y2, pt.y)).toBeLessThan(1e-12);
  });

  it('fromT === toT이면 zero-length subcurve를 반환한다', () => {
    const out = makeOut();
    quadraticPartInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2), 0.4, 0.4);
    const pt = { x: 0, y: 0 };
    quadraticPointAtTInto(pt, flatQuadraticFromLegacyPoints(p0, p1, p2), 0.4);
    expect(relErr(out.x0, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out.y0, pt.y)).toBeLessThan(1e-12);
    expect(relErr(out.x1, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out.y1, pt.y)).toBeLessThan(1e-12);
    expect(relErr(out.x2, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out.y2, pt.y)).toBeLessThan(1e-12);
  });

  it('[1, 0] 역방향 구간을 finite subcurve로 반환한다', () => {
    const out = makeOut();
    quadraticPartInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2), 1, 0);
    expect(Number.isFinite(out.x0)).toBe(true);
    expect(Number.isFinite(out.x1)).toBe(true);
    expect(Number.isFinite(out.x2)).toBe(true);
    expect(relErr(out.x0, p2.x)).toBeLessThan(1e-12);
    expect(relErr(out.y0, p2.y)).toBeLessThan(1e-12);
    expect(relErr(out.x2, p0.x)).toBeLessThan(1e-12);
    expect(relErr(out.y2, p0.y)).toBeLessThan(1e-12);
  });

  it('out을 반환한다', () => {
    const out = makeOut();
    const ret = quadraticPartInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2), 0, 1);
    expect(ret).toBe(out);
  });
});

describe('quadraticPart', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 2 };
  const p2 = { x: 4, y: 0 };

  it('plain object { p0, p1, p2 }를 반환한다', () => {
    const result = quadraticPart(flatQuadraticFromLegacyPoints(p0, p1, p2), 0.25, 0.75);
    expect(typeof result.x0).toBe('number');
    expect(typeof result.y1).toBe('number');
    expect(typeof result.x2).toBe('number');
  });

  it('quadraticPartInto와 같은 값을 반환한다', () => {
    const result = quadraticPart(flatQuadraticFromLegacyPoints(p0, p1, p2), 0.25, 0.75);
    const out = makeOut();
    quadraticPartInto(out, flatQuadraticFromLegacyPoints(p0, p1, p2), 0.25, 0.75);
    expect(relErr(result.x0, out.x0)).toBeLessThan(1e-12);
    expect(relErr(result.x1, out.x1)).toBeLessThan(1e-12);
    expect(relErr(result.x2, out.x2)).toBeLessThan(1e-12);
  });
});
