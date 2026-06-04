/**
 * cubicSpacedPointsInto / cubicSpacedPoints unit test.
 *
 * arc-length 기준으로 균등한 point collection을 검증한다.
 * 양 끝점은 t=0 / t=1로 고정하고, 중간 점은 cubicTAtLength mapping과 동치다.
 * uniform t sampling(cubicSample)과 달리 arc-length 간격을 사용한다.
 */
import { describe, expect, it } from 'vitest';
import { cubicLength } from '../../../src/curve/cubic-length';
import { cubicPointAtTInto } from '../../../src/curve/cubic-point-at-t-into';
import { cubicSpacedPoints } from '../../../src/curve/cubic-spaced-points';
import { cubicSpacedPointsInto } from '../../../src/curve/cubic-spaced-points-into';
import { cubicTAtLength } from '../../../src/curve/cubic-t-at-length';

/** 등속 직선 cubic: B(t) = (3t, 0), totalLength = 3 */
const LINE_P0 = { x: 0, y: 0 };
const LINE_P1 = { x: 1, y: 0 };
const LINE_P2 = { x: 2, y: 0 };
const LINE_P3 = { x: 3, y: 0 };

/** 굽은 cubic: 대칭 arch, 속도가 일정하지 않다 */
const CURVE_P0 = { x: 0, y: 0 };
const CURVE_P1 = { x: 0, y: 4 };
const CURVE_P2 = { x: 4, y: 4 };
const CURVE_P3 = { x: 4, y: 0 };

/** 비대칭 cubic: t=0 부근 속도가 작고 t=1 부근에서 커져 arc-length mid ≠ t=0.5 */
const ASYM_P0 = { x: 0, y: 0 };
const ASYM_P1 = { x: 1, y: 0 };
const ASYM_P2 = { x: 2, y: 0 };
const ASYM_P3 = { x: 2, y: 8 };

describe('cubicSpacedPointsInto', () => {
  it('count=2이면 start/end 두 점을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const result = cubicSpacedPointsInto(out, LINE_P0, LINE_P1, LINE_P2, LINE_P3, 2);
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ x: 0, y: 0 });
    expect(out[1]).toMatchObject({ x: 3, y: 0 });
  });

  it('등속 직선에서 arc-length 균등 좌표를 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    cubicSpacedPointsInto(out, LINE_P0, LINE_P1, LINE_P2, LINE_P3, 4);
    expect(out).toHaveLength(4);
    const expected = [0, 1, 2, 3];
    for (let i = 0; i < expected.length; i++) {
      expect(out[i].x).toBeCloseTo(expected[i], 6);
      expect(out[i].y).toBeCloseTo(0, 6);
    }
  });

  it('굽은 곡선에서 중간 점이 cubicTAtLength mapping과 동치다', () => {
    const count = 6;
    const out: { x: number; y: number }[] = [];
    cubicSpacedPointsInto(out, CURVE_P0, CURVE_P1, CURVE_P2, CURVE_P3, count);
    const total = cubicLength(CURVE_P0, CURVE_P1, CURVE_P2, CURVE_P3);
    for (let i = 1; i < count - 1; i++) {
      const t = cubicTAtLength(CURVE_P0, CURVE_P1, CURVE_P2, CURVE_P3, (total * i) / (count - 1));
      const expected = cubicPointAtTInto({ x: 0, y: 0 }, CURVE_P0, CURVE_P1, CURVE_P2, CURVE_P3, t);
      expect(out[i].x).toBeCloseTo(expected.x, 10);
      expect(out[i].y).toBeCloseTo(expected.y, 10);
    }
  });

  it('굽은 곡선에서 첫 점은 start, 마지막 점은 end와 정확히 일치한다', () => {
    const out: { x: number; y: number }[] = [];
    cubicSpacedPointsInto(out, CURVE_P0, CURVE_P1, CURVE_P2, CURVE_P3, 7);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[6]).toEqual({ x: 4, y: 0 });
  });

  it('비대칭 곡선에서 spaced sampling은 uniform t sampling과 다르다', () => {
    // 대칭 arch fixture는 arc-length mid == t=0.5라 차이를 드러내지 못한다(함정 참고).
    const spaced: { x: number; y: number }[] = [];
    cubicSpacedPointsInto(spaced, ASYM_P0, ASYM_P1, ASYM_P2, ASYM_P3, 5);
    const uniformMid = cubicPointAtTInto({ x: 0, y: 0 }, ASYM_P0, ASYM_P1, ASYM_P2, ASYM_P3, 0.5);
    const dx = spaced[2].x - uniformMid.x;
    const dy = spaced[2].y - uniformMid.y;
    expect(Math.hypot(dx, dy)).toBeGreaterThan(1e-3);
  });

  it('zero-length curve는 start point를 count개 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const p = { x: 3, y: 7 };
    cubicSpacedPointsInto(out, p, p, p, p, 4);
    expect(out).toHaveLength(4);
    for (const pt of out) {
      expect(pt).toEqual({ x: 3, y: 7 });
    }
  });

  it('count=1 (< 2)이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => cubicSpacedPointsInto(out, LINE_P0, LINE_P1, LINE_P2, LINE_P3, 1)).toThrow(RangeError);
  });

  it('fractional count (1.5)이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => cubicSpacedPointsInto(out, LINE_P0, LINE_P1, LINE_P2, LINE_P3, 1.5)).toThrow(RangeError);
  });

  it('NaN count이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => cubicSpacedPointsInto(out, LINE_P0, LINE_P1, LINE_P2, LINE_P3, Number.NaN)).toThrow(RangeError);
  });

  it('count > 0xffffffff이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => cubicSpacedPointsInto(out, LINE_P0, LINE_P1, LINE_P2, LINE_P3, 0x100000000)).toThrow(RangeError);
  });

  it('count validation 실패 시 기존 out 내용을 보존한다', () => {
    const existing = { x: 99, y: 99 };
    const out: { x: number; y: number }[] = [existing];
    expect(() => cubicSpacedPointsInto(out, LINE_P0, LINE_P1, LINE_P2, LINE_P3, 1)).toThrow(RangeError);
    expect(out).toHaveLength(1);
    expect(out[0]).toBe(existing);
  });

  it('tuple input과 object input이 동일한 결과를 반환한다', () => {
    const objOut: { x: number; y: number }[] = [];
    const tupOut: { x: number; y: number }[] = [];
    cubicSpacedPointsInto(objOut, CURVE_P0, CURVE_P1, CURVE_P2, CURVE_P3, 5);
    cubicSpacedPointsInto(tupOut, [0, 0], [0, 4], [4, 4], [4, 0], 5);
    expect(tupOut).toHaveLength(objOut.length);
    for (let i = 0; i < objOut.length; i++) {
      expect(tupOut[i].x).toBeCloseTo(objOut[i].x, 12);
      expect(tupOut[i].y).toBeCloseTo(objOut[i].y, 12);
    }
  });

  it('각 출력 point는 새로운 object이다', () => {
    const out: { x: number; y: number }[] = [];
    cubicSpacedPointsInto(out, LINE_P0, LINE_P1, LINE_P2, LINE_P3, 3);
    expect(out[0]).not.toBe(LINE_P0);
    expect(out[2]).not.toBe(LINE_P3);
    expect(out[0]).not.toBe(out[1]);
  });

  it('NaN 좌표는 결과로 pass-through된다', () => {
    const out: { x: number; y: number }[] = [];
    cubicSpacedPointsInto(out, { x: Number.NaN, y: 0 }, LINE_P1, LINE_P2, LINE_P3, 3);
    expect(Number.isNaN(out[0].x)).toBe(true);
  });

  it('Infinity / -Infinity 좌표는 결과로 pass-through된다', () => {
    const out: { x: number; y: number }[] = [];
    cubicSpacedPointsInto(
      out,
      { x: Number.POSITIVE_INFINITY, y: 0 },
      LINE_P1,
      LINE_P2,
      { x: 3, y: Number.NEGATIVE_INFINITY },
      2
    );
    expect(out[0].x).toBe(Number.POSITIVE_INFINITY);
    expect(out[1].y).toBe(Number.NEGATIVE_INFINITY);
  });
});

describe('cubicSpacedPoints', () => {
  it('cubicSpacedPointsInto와 deep equal 결과를 반환한다', () => {
    const into: { x: number; y: number }[] = [];
    cubicSpacedPointsInto(into, CURVE_P0, CURVE_P1, CURVE_P2, CURVE_P3, 6);
    const companion = cubicSpacedPoints(CURVE_P0, CURVE_P1, CURVE_P2, CURVE_P3, 6);
    expect(companion).toEqual(into);
  });

  it('호출마다 새 배열을 반환한다', () => {
    const a = cubicSpacedPoints(LINE_P0, LINE_P1, LINE_P2, LINE_P3, 3);
    const b = cubicSpacedPoints(LINE_P0, LINE_P1, LINE_P2, LINE_P3, 3);
    expect(a).not.toBe(b);
  });

  it('count validation 실패 시 RangeError를 던진다', () => {
    expect(() => cubicSpacedPoints(LINE_P0, LINE_P1, LINE_P2, LINE_P3, 1)).toThrow(RangeError);
  });
});
