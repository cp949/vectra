/**
 * cubicPartInto / cubicPart unit test.
 *
 * 기준값: cubicSplitInto 두 번 적용 결과와 비교.
 * - fromT에서 split하여 right를 얻고, 그 right에서 t2에서 left를 얻는다.
 * - 역방향 구간은 cubicPointAtTInto(fromT)에서 시작해 cubicPointAtTInto(toT)에서 끝난다.
 */

import { describe, expect, it } from 'vitest';
import { cubicPart } from '../../../src/curve/cubic-part';
import { cubicPartInto } from '../../../src/curve/cubic-part-into';
import { cubicPointAtTInto } from '../../../src/curve/cubic-point-at-t-into';
import { cubicSplitInto } from '../../../src/curve/cubic-split-into';

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

/**
 * splitInto 두 번으로 기준값 계산: [fromT, toT] subcurve.
 */
function refSubcurve(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  fromT: number,
  toT: number
) {
  if (fromT === 0) {
    const left = makeOut();
    const right = makeOut();
    cubicSplitInto(left, right, p0, p1, p2, p3, toT);
    return left;
  }
  if (toT === 1) {
    const left = makeOut();
    const right = makeOut();
    cubicSplitInto(left, right, p0, p1, p2, p3, fromT);
    return right;
  }
  // 일반: step1 right → step2 left
  const left1 = makeOut();
  const right1 = makeOut();
  cubicSplitInto(left1, right1, p0, p1, p2, p3, fromT);
  const t2 = (toT - fromT) / (1 - fromT);
  const left2 = makeOut();
  const right2 = makeOut();
  cubicSplitInto(left2, right2, right1.p0, right1.p1, right1.p2, right1.p3, t2);
  return left2;
}

describe('cubicPartInto', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 3 };
  const p2 = { x: 3, y: 3 };
  const p3 = { x: 4, y: 0 };

  it('[0, 1] 구간은 원본 curve와 동일하다', () => {
    const out = makeOut();
    cubicPartInto(out, p0, p1, p2, p3, 0, 1);
    expect(relErr(out.p0.x, 0)).toBeLessThan(1e-12);
    expect(relErr(out.p0.y, 0)).toBeLessThan(1e-12);
    expect(relErr(out.p1.x, 1)).toBeLessThan(1e-12);
    expect(relErr(out.p1.y, 3)).toBeLessThan(1e-12);
    expect(relErr(out.p2.x, 3)).toBeLessThan(1e-12);
    expect(relErr(out.p2.y, 3)).toBeLessThan(1e-12);
    expect(relErr(out.p3.x, 4)).toBeLessThan(1e-12);
    expect(relErr(out.p3.y, 0)).toBeLessThan(1e-12);
  });

  it('[0, 0.5] 구간은 splitInto left와 같다', () => {
    const out = makeOut();
    cubicPartInto(out, p0, p1, p2, p3, 0, 0.5);
    const ref = refSubcurve(p0, p1, p2, p3, 0, 0.5);
    expect(relErr(out.p0.x, ref.p0.x)).toBeLessThan(1e-12);
    expect(relErr(out.p0.y, ref.p0.y)).toBeLessThan(1e-12);
    expect(relErr(out.p1.x, ref.p1.x)).toBeLessThan(1e-12);
    expect(relErr(out.p1.y, ref.p1.y)).toBeLessThan(1e-12);
    expect(relErr(out.p2.x, ref.p2.x)).toBeLessThan(1e-12);
    expect(relErr(out.p2.y, ref.p2.y)).toBeLessThan(1e-12);
    expect(relErr(out.p3.x, ref.p3.x)).toBeLessThan(1e-12);
    expect(relErr(out.p3.y, ref.p3.y)).toBeLessThan(1e-12);
  });

  it('[0.5, 1] 구간은 splitInto right와 같다', () => {
    const out = makeOut();
    cubicPartInto(out, p0, p1, p2, p3, 0.5, 1);
    const ref = refSubcurve(p0, p1, p2, p3, 0.5, 1);
    expect(relErr(out.p0.x, ref.p0.x)).toBeLessThan(1e-12);
    expect(relErr(out.p0.y, ref.p0.y)).toBeLessThan(1e-12);
    expect(relErr(out.p1.x, ref.p1.x)).toBeLessThan(1e-12);
    expect(relErr(out.p1.y, ref.p1.y)).toBeLessThan(1e-12);
    expect(relErr(out.p2.x, ref.p2.x)).toBeLessThan(1e-12);
    expect(relErr(out.p2.y, ref.p2.y)).toBeLessThan(1e-12);
    expect(relErr(out.p3.x, ref.p3.x)).toBeLessThan(1e-12);
    expect(relErr(out.p3.y, ref.p3.y)).toBeLessThan(1e-12);
  });

  it('[0.25, 0.75] 구간은 split 두 번 결과와 같다', () => {
    const out = makeOut();
    cubicPartInto(out, p0, p1, p2, p3, 0.25, 0.75);
    const ref = refSubcurve(p0, p1, p2, p3, 0.25, 0.75);
    expect(relErr(out.p0.x, ref.p0.x)).toBeLessThan(1e-12);
    expect(relErr(out.p0.y, ref.p0.y)).toBeLessThan(1e-12);
    expect(relErr(out.p1.x, ref.p1.x)).toBeLessThan(1e-12);
    expect(relErr(out.p1.y, ref.p1.y)).toBeLessThan(1e-12);
    expect(relErr(out.p2.x, ref.p2.x)).toBeLessThan(1e-12);
    expect(relErr(out.p2.y, ref.p2.y)).toBeLessThan(1e-12);
    expect(relErr(out.p3.x, ref.p3.x)).toBeLessThan(1e-12);
    expect(relErr(out.p3.y, ref.p3.y)).toBeLessThan(1e-12);
  });

  it('subcurve의 p0은 원본 curve cubicPointAtTInto(fromT)와 같다', () => {
    const out = makeOut();
    cubicPartInto(out, p0, p1, p2, p3, 0.3, 0.7);
    const pt = { x: 0, y: 0 };
    cubicPointAtTInto(pt, p0, p1, p2, p3, 0.3);
    expect(relErr(out.p0.x, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out.p0.y, pt.y)).toBeLessThan(1e-12);
  });

  it('subcurve의 p3는 원본 curve cubicPointAtTInto(toT)와 같다', () => {
    const out = makeOut();
    cubicPartInto(out, p0, p1, p2, p3, 0.3, 0.7);
    const pt = { x: 0, y: 0 };
    cubicPointAtTInto(pt, p0, p1, p2, p3, 0.7);
    expect(relErr(out.p3.x, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out.p3.y, pt.y)).toBeLessThan(1e-12);
  });

  it('fromT === toT이면 zero-length subcurve를 반환한다', () => {
    const out = makeOut();
    cubicPartInto(out, p0, p1, p2, p3, 0.4, 0.4);
    const pt = { x: 0, y: 0 };
    cubicPointAtTInto(pt, p0, p1, p2, p3, 0.4);
    expect(relErr(out.p0.x, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out.p0.y, pt.y)).toBeLessThan(1e-12);
    expect(relErr(out.p1.x, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out.p1.y, pt.y)).toBeLessThan(1e-12);
    expect(relErr(out.p2.x, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out.p2.y, pt.y)).toBeLessThan(1e-12);
    expect(relErr(out.p3.x, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out.p3.y, pt.y)).toBeLessThan(1e-12);
  });

  it('[1, 0] 역방향 구간을 finite subcurve로 반환한다', () => {
    const out = makeOut();
    cubicPartInto(out, p0, p1, p2, p3, 1, 0);
    expect(Number.isFinite(out.p0.x)).toBe(true);
    expect(Number.isFinite(out.p1.x)).toBe(true);
    expect(Number.isFinite(out.p2.x)).toBe(true);
    expect(Number.isFinite(out.p3.x)).toBe(true);
    expect(relErr(out.p0.x, p3.x)).toBeLessThan(1e-12);
    expect(relErr(out.p0.y, p3.y)).toBeLessThan(1e-12);
    expect(relErr(out.p3.x, p0.x)).toBeLessThan(1e-12);
    expect(relErr(out.p3.y, p0.y)).toBeLessThan(1e-12);
  });

  it('out을 반환한다', () => {
    const out = makeOut();
    const ret = cubicPartInto(out, p0, p1, p2, p3, 0, 1);
    expect(ret).toBe(out);
  });

  it('tuple XYInput을 받는다', () => {
    const out = makeOut();
    cubicPartInto(out, [0, 0], [1, 3], [3, 3], [4, 0], 0.25, 0.75);
    const ref = refSubcurve(p0, p1, p2, p3, 0.25, 0.75);
    expect(relErr(out.p3.x, ref.p3.x)).toBeLessThan(1e-12);
  });
});

describe('cubicPart', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 3 };
  const p2 = { x: 3, y: 3 };
  const p3 = { x: 4, y: 0 };

  it('plain object { p0, p1, p2, p3 }를 반환한다', () => {
    const result = cubicPart(p0, p1, p2, p3, 0.25, 0.75);
    expect(typeof result.p0.x).toBe('number');
    expect(typeof result.p1.y).toBe('number');
    expect(typeof result.p2.x).toBe('number');
    expect(typeof result.p3.y).toBe('number');
  });

  it('cubicPartInto와 같은 값을 반환한다', () => {
    const result = cubicPart(p0, p1, p2, p3, 0.25, 0.75);
    const out = makeOut();
    cubicPartInto(out, p0, p1, p2, p3, 0.25, 0.75);
    expect(relErr(result.p0.x, out.p0.x)).toBeLessThan(1e-12);
    expect(relErr(result.p1.x, out.p1.x)).toBeLessThan(1e-12);
    expect(relErr(result.p2.x, out.p2.x)).toBeLessThan(1e-12);
    expect(relErr(result.p3.x, out.p3.x)).toBeLessThan(1e-12);
  });
});
