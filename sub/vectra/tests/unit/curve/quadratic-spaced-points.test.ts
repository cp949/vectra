/**
 * quadraticSpacedPointsInto / quadraticSpacedPoints unit test.
 *
 * arc-length 기준으로 균등한 point collection을 검증한다.
 * 양 끝점은 t=0 / t=1로 고정하고, 중간 점은 quadraticTAtLength mapping과 동치다.
 * uniform t sampling(quadraticSample)과 달리 arc-length 간격을 사용한다.
 */
import { describe, expect, it } from 'vitest';
import { quadraticLength } from '../../../src/curve/quadratic-length';
import { quadraticPointAtTInto } from '../../../src/curve/quadratic-point-at-t-into';
import { quadraticSpacedPoints } from '../../../src/curve/quadratic-spaced-points';
import { quadraticSpacedPointsInto } from '../../../src/curve/quadratic-spaced-points-into';
import { quadraticTAtLength } from '../../../src/curve/quadratic-t-at-length';

/** 등속 직선 quadratic: B(t) = (2t, 0), totalLength = 2 */
const LINE_P0 = { x: 0, y: 0 };
const LINE_P1 = { x: 1, y: 0 };
const LINE_P2 = { x: 2, y: 0 };

/** 굽은 비대칭 quadratic: t=0에서 속도 4, t=1에서 속도 12 → arc-length mid ≠ t=0.5 */
const CURVE_P0 = { x: 0, y: 0 };
const CURVE_P1 = { x: 2, y: 0 };
const CURVE_P2 = { x: 2, y: 6 };

describe('quadraticSpacedPointsInto', () => {
  it('count=2이면 start/end 두 점을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const result = quadraticSpacedPointsInto(out, LINE_P0, LINE_P1, LINE_P2, 2);
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ x: 0, y: 0 });
    expect(out[1]).toMatchObject({ x: 2, y: 0 });
  });

  it('등속 직선에서 arc-length 균등 좌표를 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    quadraticSpacedPointsInto(out, LINE_P0, LINE_P1, LINE_P2, 5);
    expect(out).toHaveLength(5);
    // totalLength=2, 4 구간 → 각 0.5 간격, x = arc length
    const expected = [0, 0.5, 1, 1.5, 2];
    for (let i = 0; i < expected.length; i++) {
      expect(out[i].x).toBeCloseTo(expected[i], 6);
      expect(out[i].y).toBeCloseTo(0, 6);
    }
  });

  it('굽은 곡선에서 중간 점이 quadraticTAtLength mapping과 동치다', () => {
    const count = 6;
    const out: { x: number; y: number }[] = [];
    quadraticSpacedPointsInto(out, CURVE_P0, CURVE_P1, CURVE_P2, count);
    const total = quadraticLength(CURVE_P0, CURVE_P1, CURVE_P2);
    for (let i = 1; i < count - 1; i++) {
      const t = quadraticTAtLength(CURVE_P0, CURVE_P1, CURVE_P2, (total * i) / (count - 1));
      const expected = quadraticPointAtTInto({ x: 0, y: 0 }, CURVE_P0, CURVE_P1, CURVE_P2, t);
      expect(out[i].x).toBeCloseTo(expected.x, 10);
      expect(out[i].y).toBeCloseTo(expected.y, 10);
    }
  });

  it('굽은 곡선에서 첫 점은 start, 마지막 점은 end와 정확히 일치한다', () => {
    const out: { x: number; y: number }[] = [];
    quadraticSpacedPointsInto(out, CURVE_P0, CURVE_P1, CURVE_P2, 7);
    // t=1 boundary가 binary search drift 없이 정확히 end point가 되어야 한다
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[6]).toEqual({ x: 2, y: 6 });
  });

  it('굽은 곡선에서 spaced sampling은 uniform t sampling과 다르다', () => {
    const spaced: { x: number; y: number }[] = [];
    quadraticSpacedPointsInto(spaced, CURVE_P0, CURVE_P1, CURVE_P2, 5);
    const uniformMid = quadraticPointAtTInto({ x: 0, y: 0 }, CURVE_P0, CURVE_P1, CURVE_P2, 0.5);
    // 중앙 점이 t=0.5 uniform 점과 일치하지 않아야 한다
    const dx = spaced[2].x - uniformMid.x;
    const dy = spaced[2].y - uniformMid.y;
    expect(Math.hypot(dx, dy)).toBeGreaterThan(1e-3);
  });

  it('options를 생략하면 기본 TAtLength 탐색 옵션을 사용한다', () => {
    const out: { x: number; y: number }[] = [];
    quadraticSpacedPointsInto(out, CURVE_P0, CURVE_P1, CURVE_P2, 4);
    expect(out).toHaveLength(4);
  });

  it('zero-length curve는 start point를 count개 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const p = { x: 3, y: 7 };
    quadraticSpacedPointsInto(out, p, p, p, 4);
    expect(out).toHaveLength(4);
    for (const pt of out) {
      expect(pt).toEqual({ x: 3, y: 7 });
    }
  });

  it('count=1 (< 2)이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => quadraticSpacedPointsInto(out, LINE_P0, LINE_P1, LINE_P2, 1)).toThrow(RangeError);
  });

  it('fractional count (1.5)이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => quadraticSpacedPointsInto(out, LINE_P0, LINE_P1, LINE_P2, 1.5)).toThrow(RangeError);
  });

  it('NaN count이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => quadraticSpacedPointsInto(out, LINE_P0, LINE_P1, LINE_P2, Number.NaN)).toThrow(RangeError);
  });

  it('count > 0xffffffff이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => quadraticSpacedPointsInto(out, LINE_P0, LINE_P1, LINE_P2, 0x100000000)).toThrow(RangeError);
  });

  it('count validation 실패 시 기존 out 내용을 보존한다', () => {
    const existing = { x: 99, y: 99 };
    const out: { x: number; y: number }[] = [existing];
    expect(() => quadraticSpacedPointsInto(out, LINE_P0, LINE_P1, LINE_P2, 1)).toThrow(RangeError);
    expect(out).toHaveLength(1);
    expect(out[0]).toBe(existing);
  });

  it('tuple input과 object input이 동일한 결과를 반환한다', () => {
    const objOut: { x: number; y: number }[] = [];
    const tupOut: { x: number; y: number }[] = [];
    quadraticSpacedPointsInto(objOut, CURVE_P0, CURVE_P1, CURVE_P2, 5);
    quadraticSpacedPointsInto(tupOut, [0, 0], [2, 0], [2, 6], 5);
    expect(tupOut).toHaveLength(objOut.length);
    for (let i = 0; i < objOut.length; i++) {
      expect(tupOut[i].x).toBeCloseTo(objOut[i].x, 12);
      expect(tupOut[i].y).toBeCloseTo(objOut[i].y, 12);
    }
  });

  it('각 출력 point는 새로운 object이다', () => {
    const out: { x: number; y: number }[] = [];
    quadraticSpacedPointsInto(out, LINE_P0, LINE_P1, LINE_P2, 3);
    expect(out[0]).not.toBe(LINE_P0);
    expect(out[2]).not.toBe(LINE_P2);
    expect(out[0]).not.toBe(out[1]);
  });

  it('NaN 좌표는 결과로 pass-through된다', () => {
    const out: { x: number; y: number }[] = [];
    quadraticSpacedPointsInto(out, { x: Number.NaN, y: 0 }, LINE_P1, LINE_P2, 3);
    expect(Number.isNaN(out[0].x)).toBe(true);
  });

  it('Infinity / -Infinity 좌표는 결과로 pass-through된다', () => {
    const out: { x: number; y: number }[] = [];
    quadraticSpacedPointsInto(
      out,
      { x: Number.POSITIVE_INFINITY, y: 0 },
      LINE_P1,
      { x: 2, y: Number.NEGATIVE_INFINITY },
      2
    );
    expect(out[0].x).toBe(Number.POSITIVE_INFINITY);
    expect(out[1].y).toBe(Number.NEGATIVE_INFINITY);
  });
});

describe('quadraticSpacedPoints', () => {
  it('quadraticSpacedPointsInto와 deep equal 결과를 반환한다', () => {
    const into: { x: number; y: number }[] = [];
    quadraticSpacedPointsInto(into, CURVE_P0, CURVE_P1, CURVE_P2, 6);
    const companion = quadraticSpacedPoints(CURVE_P0, CURVE_P1, CURVE_P2, 6);
    expect(companion).toEqual(into);
  });

  it('호출마다 새 배열을 반환한다', () => {
    const a = quadraticSpacedPoints(LINE_P0, LINE_P1, LINE_P2, 3);
    const b = quadraticSpacedPoints(LINE_P0, LINE_P1, LINE_P2, 3);
    expect(a).not.toBe(b);
  });

  it('count validation 실패 시 RangeError를 던진다', () => {
    expect(() => quadraticSpacedPoints(LINE_P0, LINE_P1, LINE_P2, 1)).toThrow(RangeError);
  });
});
