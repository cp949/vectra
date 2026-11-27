/**
 * cubicPartInto의 [fromT, toT] 부분 곡선을 cubicSplitInto 두 번 적용한 기준값과 비교한다.
 * 끝점 일치, fromT와 toT가 같은 경우, 역방향 구간, out 반환을 다룬다.
 * cubicPart는 Into와 같은 값을 새 객체로 돌려준다.
 */
import { flatCubicFromLegacyPoints } from '../../../src/internal/legacy-curve.internal';
import { describe, expect, it } from 'vitest';
import { cubicPart } from '../../../src/curve/cubic-part';
import { cubicPartInto } from '../../../src/curve/cubic-part-into';
import { cubicPointAtTInto } from '../../../src/curve/cubic-point-at-t-into';
import { cubicSplitInto } from '../../../src/curve/cubic-split-into';

/**
 * 기대값 대비 상대 오차를 구한다.
 * 기대값이 0이면 절대 오차를 돌려준다.
 */
function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

/**
 * out 인자로 넘길 0 초기값 평평한 cubic 객체를 만든다.
 * 기준값 계산의 cubicSplitInto 출력에도 쓴다.
 */
function makeOut() {
  return { kind: 'cubic' as const, x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 };
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
    cubicSplitInto(left, right, flatCubicFromLegacyPoints(p0, p1, p2, p3), toT);
    return left;
  }
  if (toT === 1) {
    const left = makeOut();
    const right = makeOut();
    cubicSplitInto(left, right, flatCubicFromLegacyPoints(p0, p1, p2, p3), fromT);
    return right;
  }
  // 일반: step1 right → step2 left
  const left1 = makeOut();
  const right1 = makeOut();
  cubicSplitInto(left1, right1, flatCubicFromLegacyPoints(p0, p1, p2, p3), fromT);
  const t2 = (toT - fromT) / (1 - fromT);
  const left2 = makeOut();
  const right2 = makeOut();
  cubicSplitInto(left2, right2, right1, t2);
  return left2;
}

describe('cubicPartInto', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 3 };
  const p2 = { x: 3, y: 3 };
  const p3 = { x: 4, y: 0 };

  it('[0, 1] 구간은 원본 curve와 동일하다', () => {
    const out = makeOut();
    cubicPartInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0, 1);
    expect(relErr(out.x0, 0)).toBeLessThan(1e-12);
    expect(relErr(out.y0, 0)).toBeLessThan(1e-12);
    expect(relErr(out.x1, 1)).toBeLessThan(1e-12);
    expect(relErr(out.y1, 3)).toBeLessThan(1e-12);
    expect(relErr(out.x2, 3)).toBeLessThan(1e-12);
    expect(relErr(out.y2, 3)).toBeLessThan(1e-12);
    expect(relErr(out.x3, 4)).toBeLessThan(1e-12);
    expect(relErr(out.y3, 0)).toBeLessThan(1e-12);
  });

  it('[0, 0.5] 구간은 splitInto left와 같다', () => {
    const out = makeOut();
    cubicPartInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0, 0.5);
    const ref = refSubcurve(p0, p1, p2, p3, 0, 0.5);
    expect(relErr(out.x0, ref.x0)).toBeLessThan(1e-12);
    expect(relErr(out.y0, ref.y0)).toBeLessThan(1e-12);
    expect(relErr(out.x1, ref.x1)).toBeLessThan(1e-12);
    expect(relErr(out.y1, ref.y1)).toBeLessThan(1e-12);
    expect(relErr(out.x2, ref.x2)).toBeLessThan(1e-12);
    expect(relErr(out.y2, ref.y2)).toBeLessThan(1e-12);
    expect(relErr(out.x3, ref.x3)).toBeLessThan(1e-12);
    expect(relErr(out.y3, ref.y3)).toBeLessThan(1e-12);
  });

  it('[0.5, 1] 구간은 splitInto right와 같다', () => {
    const out = makeOut();
    cubicPartInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5, 1);
    const ref = refSubcurve(p0, p1, p2, p3, 0.5, 1);
    expect(relErr(out.x0, ref.x0)).toBeLessThan(1e-12);
    expect(relErr(out.y0, ref.y0)).toBeLessThan(1e-12);
    expect(relErr(out.x1, ref.x1)).toBeLessThan(1e-12);
    expect(relErr(out.y1, ref.y1)).toBeLessThan(1e-12);
    expect(relErr(out.x2, ref.x2)).toBeLessThan(1e-12);
    expect(relErr(out.y2, ref.y2)).toBeLessThan(1e-12);
    expect(relErr(out.x3, ref.x3)).toBeLessThan(1e-12);
    expect(relErr(out.y3, ref.y3)).toBeLessThan(1e-12);
  });

  it('[0.25, 0.75] 구간은 split 두 번 결과와 같다', () => {
    const out = makeOut();
    cubicPartInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.25, 0.75);
    const ref = refSubcurve(p0, p1, p2, p3, 0.25, 0.75);
    expect(relErr(out.x0, ref.x0)).toBeLessThan(1e-12);
    expect(relErr(out.y0, ref.y0)).toBeLessThan(1e-12);
    expect(relErr(out.x1, ref.x1)).toBeLessThan(1e-12);
    expect(relErr(out.y1, ref.y1)).toBeLessThan(1e-12);
    expect(relErr(out.x2, ref.x2)).toBeLessThan(1e-12);
    expect(relErr(out.y2, ref.y2)).toBeLessThan(1e-12);
    expect(relErr(out.x3, ref.x3)).toBeLessThan(1e-12);
    expect(relErr(out.y3, ref.y3)).toBeLessThan(1e-12);
  });

  it('subcurve의 p0은 원본 curve cubicPointAtTInto(fromT)와 같다', () => {
    const out = makeOut();
    cubicPartInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.3, 0.7);
    const pt = { x: 0, y: 0 };
    cubicPointAtTInto(pt, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.3);
    expect(relErr(out.x0, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out.y0, pt.y)).toBeLessThan(1e-12);
  });

  it('subcurve의 p3는 원본 curve cubicPointAtTInto(toT)와 같다', () => {
    const out = makeOut();
    cubicPartInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.3, 0.7);
    const pt = { x: 0, y: 0 };
    cubicPointAtTInto(pt, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.7);
    expect(relErr(out.x3, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out.y3, pt.y)).toBeLessThan(1e-12);
  });

  it('fromT === toT이면 zero-length subcurve를 반환한다', () => {
    const out = makeOut();
    cubicPartInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.4, 0.4);
    const pt = { x: 0, y: 0 };
    cubicPointAtTInto(pt, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.4);
    expect(relErr(out.x0, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out.y0, pt.y)).toBeLessThan(1e-12);
    expect(relErr(out.x1, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out.y1, pt.y)).toBeLessThan(1e-12);
    expect(relErr(out.x2, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out.y2, pt.y)).toBeLessThan(1e-12);
    expect(relErr(out.x3, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out.y3, pt.y)).toBeLessThan(1e-12);
  });

  it('[1, 0] 역방향 구간을 finite subcurve로 반환한다', () => {
    const out = makeOut();
    cubicPartInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 1, 0);
    expect(Number.isFinite(out.x0)).toBe(true);
    expect(Number.isFinite(out.x1)).toBe(true);
    expect(Number.isFinite(out.x2)).toBe(true);
    expect(Number.isFinite(out.x3)).toBe(true);
    expect(relErr(out.x0, p3.x)).toBeLessThan(1e-12);
    expect(relErr(out.y0, p3.y)).toBeLessThan(1e-12);
    expect(relErr(out.x3, p0.x)).toBeLessThan(1e-12);
    expect(relErr(out.y3, p0.y)).toBeLessThan(1e-12);
  });

  it('out을 반환한다', () => {
    const out = makeOut();
    const ret = cubicPartInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0, 1);
    expect(ret).toBe(out);
  });
});

describe('cubicPart', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 3 };
  const p2 = { x: 3, y: 3 };
  const p3 = { x: 4, y: 0 };

  it('plain object { p0, p1, p2, p3 }를 반환한다', () => {
    const result = cubicPart(flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.25, 0.75);
    expect(typeof result.x0).toBe('number');
    expect(typeof result.y1).toBe('number');
    expect(typeof result.x2).toBe('number');
    expect(typeof result.y3).toBe('number');
  });

  it('cubicPartInto와 같은 값을 반환한다', () => {
    const result = cubicPart(flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.25, 0.75);
    const out = makeOut();
    cubicPartInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.25, 0.75);
    expect(relErr(result.x0, out.x0)).toBeLessThan(1e-12);
    expect(relErr(result.x1, out.x1)).toBeLessThan(1e-12);
    expect(relErr(result.x2, out.x2)).toBeLessThan(1e-12);
    expect(relErr(result.x3, out.x3)).toBeLessThan(1e-12);
  });
});
