import { describe, expect, it } from 'vitest';
import { cubicHullInto } from '../../../src/curve/cubic-hull-into';
import { cubicPointAtTInto } from '../../../src/curve/cubic-point-at-t-into';
import { cubicSplitInto } from '../../../src/curve/cubic-split-into';

function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

describe('cubicSplitInto', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 3 };
  const p2 = { x: 3, y: 3 };
  const p3 = { x: 4, y: 0 };

  function makeOut() {
    return {
      p0: { x: 0, y: 0 },
      p1: { x: 0, y: 0 },
      p2: { x: 0, y: 0 },
      p3: { x: 0, y: 0 },
    };
  }

  it('left.p0이 원본 p0과 같다', () => {
    const outL = makeOut();
    const outR = makeOut();
    cubicSplitInto(outL, outR, p0, p1, p2, p3, 0.5);
    expect(outL.p0.x).toBe(0);
    expect(outL.p0.y).toBe(0);
  });

  it('right.p3이 원본 p3과 같다', () => {
    const outL = makeOut();
    const outR = makeOut();
    cubicSplitInto(outL, outR, p0, p1, p2, p3, 0.5);
    expect(outR.p3.x).toBe(4);
    expect(outR.p3.y).toBe(0);
  });

  it('left.p3과 right.p0이 같다 (de Casteljau 연속성)', () => {
    const outL = makeOut();
    const outR = makeOut();
    cubicSplitInto(outL, outR, p0, p1, p2, p3, 0.5);
    expect(outL.p3.x).toBe(outR.p0.x);
    expect(outL.p3.y).toBe(outR.p0.y);
  });

  it('split point가 cubicPointAtTInto(t) 값과 일치한다', () => {
    const outL = makeOut();
    const outR = makeOut();
    cubicSplitInto(outL, outR, p0, p1, p2, p3, 0.5);
    const pt = { x: 0, y: 0 };
    cubicPointAtTInto(pt, p0, p1, p2, p3, 0.5);
    expect(relErr(outL.p3.x, pt.x)).toBeLessThan(1e-12);
    expect(relErr(outL.p3.y, pt.y)).toBeLessThan(1e-12);
  });

  it('outLeft를 반환한다 (identity)', () => {
    const outL = makeOut();
    const outR = makeOut();
    const ret = cubicSplitInto(outL, outR, p0, p1, p2, p3, 0.5);
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
    cubicHullInto(out, p0, p1, p2, p3, 0.5);
    expect(out.length).toBe(10);
  });

  it('out.length = 0 후 push한다 (기존 내용 clear)', () => {
    const sentinel = { x: 99, y: 99 };
    const out = [sentinel];
    cubicHullInto(out, p0, p1, p2, p3, 0.5);
    expect(out.length).toBe(10);
    expect(out[0]).not.toBe(sentinel);
  });

  it('out[0]이 p0이다', () => {
    const out: { x: number; y: number }[] = [];
    cubicHullInto(out, p0, p1, p2, p3, 0);
    expect(out[0].x).toBe(0);
    expect(out[0].y).toBe(0);
  });

  it('out[3]이 p3이다', () => {
    const out: { x: number; y: number }[] = [];
    cubicHullInto(out, p0, p1, p2, p3, 0);
    expect(out[3].x).toBe(4);
    expect(out[3].y).toBe(0);
  });

  it('out[9](pointAt)이 cubicPointAtTInto(t) 값과 일치한다', () => {
    const out: { x: number; y: number }[] = [];
    cubicHullInto(out, p0, p1, p2, p3, 0.5);
    const pt = { x: 0, y: 0 };
    cubicPointAtTInto(pt, p0, p1, p2, p3, 0.5);
    expect(relErr(out[9].x, pt.x)).toBeLessThan(1e-12);
    expect(relErr(out[9].y, pt.y)).toBeLessThan(1e-12);
  });

  it('out을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const ret = cubicHullInto(out, p0, p1, p2, p3, 0.5);
    expect(ret).toBe(out);
  });
});
