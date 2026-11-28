/**
 * cubicSplitInto의 좌우 곡선이 끝점을 공유하고 분할점이 cubicPointAtTInto와 같은지 검증한다.
 * cubicHullInto가 de Casteljau 점 10개를 기록하고 out을 비운 뒤 채우는지 확인한다.
 */
import { describe, expect, it } from 'vitest';
import { cubicHullInto } from '../../../src/curve/cubic-hull-into';
import { cubicPointAtTInto } from '../../../src/curve/cubic-point-at-t-into';
import { cubicSplitInto } from '../../../src/curve/cubic-split-into';
import { flatCubicFromLegacyPoints } from '../_helpers/curve-fixtures';

/**
 * 기대값 대비 상대 오차를 구한다.
 * 기대값이 0이면 절대 오차를 돌려준다.
 */
function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

describe('cubicSplitInto', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 3 };
  const p2 = { x: 3, y: 3 };
  const p3 = { x: 4, y: 0 };

  /**
   * cubicSplitInto의 left, right out으로 넘길 0 초기값 평평한 cubic을 만든다.
   */
  function makeOut() {
    return { kind: 'cubic' as const, x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 };
  }

  it('left.p0이 원본 p0과 같다', () => {
    const outL = makeOut();
    const outR = makeOut();
    cubicSplitInto(outL, outR, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    expect(outL.x0).toBe(0);
    expect(outL.y0).toBe(0);
  });

  it('right.p3이 원본 p3과 같다', () => {
    const outL = makeOut();
    const outR = makeOut();
    cubicSplitInto(outL, outR, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    expect(outR.x3).toBe(4);
    expect(outR.y3).toBe(0);
  });

  it('left.p3과 right.p0이 같다 (de Casteljau 연속성)', () => {
    const outL = makeOut();
    const outR = makeOut();
    cubicSplitInto(outL, outR, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    expect(outL.x3).toBe(outR.x0);
    expect(outL.y3).toBe(outR.y0);
  });

  it('split point가 cubicPointAtTInto(t) 값과 일치한다', () => {
    const outL = makeOut();
    const outR = makeOut();
    cubicSplitInto(outL, outR, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    const pt = { x: 0, y: 0 };
    cubicPointAtTInto(pt, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    expect(relErr(outL.x3, pt.x)).toBeLessThan(1e-12);
    expect(relErr(outL.y3, pt.y)).toBeLessThan(1e-12);
  });

  it('outLeft를 반환한다 (identity)', () => {
    const outL = makeOut();
    const outR = makeOut();
    const ret = cubicSplitInto(outL, outR, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    expect(ret).toBe(outL);
  });
});

describe('cubicHullInto', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 3 };
  const p2 = { x: 3, y: 3 };
  const p3 = { x: 4, y: 0 };

  it('t=0.5에서 10개 point를 생성한다', () => {
    const out: { x: number; y: number }[] = [];
    cubicHullInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    expect(out.length).toBe(10);
  });

  it('out.length = 0 후 push한다 (기존 내용 clear)', () => {
    const sentinel = { x: 99, y: 99 };
    const out = [sentinel];
    cubicHullInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    expect(out.length).toBe(10);
    expect(out[0]).not.toBe(sentinel);
  });

  it('out[0]이 p0이다', () => {
    const out: { x: number; y: number }[] = [];
    cubicHullInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0);
    expect(out[0].x).toBe(0);
    expect(out[0].y).toBe(0);
  });

  it('out[3]이 p3이다', () => {
    const out: { x: number; y: number }[] = [];
    cubicHullInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0);
    expect(out[3].x).toBe(4);
    expect(out[3].y).toBe(0);
  });

  it('out[9](pointAt)이 cubicPointAtTInto(t) 값과 일치한다', () => {
    const out: { x: number; y: number }[] = [];
    cubicHullInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    const pt = { x: 0, y: 0 };
    cubicPointAtTInto(pt, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    expect(relErr(out[9].x, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out[9].y, pt.y)).toBeLessThan(1e-12);
  });

  it('out을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const ret = cubicHullInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    expect(ret).toBe(out);
  });
});
