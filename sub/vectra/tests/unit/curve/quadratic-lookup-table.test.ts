/**
 * quadraticLookupTableInto가 균등 t 표본의 현 길이 누적표를 기록하는지 검증한다.
 * 첫 항목은 t 0, 길이 0이고 마지막 항목은 t 1이다.
 * 잘못된 steps의 RangeError와 out 보존, non-finite 좌표 전파도 다룬다.
 * quadraticLookupTable은 Into 결과와 같은 값을 돌려준다.
 */
import { flatQuadraticFromLegacyPoints } from '../_helpers/curve-fixtures';
import { describe, expect, it } from 'vitest';
import { quadraticLength } from '../../../src/curve/quadratic-length';
import { quadraticLookupTable } from '../../../src/curve/quadratic-lookup-table';
import { quadraticLookupTableInto } from '../../../src/curve/quadratic-lookup-table-into';

/** 등속 직선 quadratic: B(t) = (2t, 0), 단조 직선, totalLength = 2 */
const LINE_P0 = { x: 0, y: 0 };
const LINE_P1 = { x: 1, y: 0 };
const LINE_P2 = { x: 2, y: 0 };

/** 굽은 비대칭 quadratic: chord 누적이 exact arc length를 underestimate */
const CURVE_P0 = { x: 0, y: 0 };
const CURVE_P1 = { x: 2, y: 0 };
const CURVE_P2 = { x: 2, y: 6 };

describe('quadraticLookupTableInto', () => {
  it('steps=2이면 { t:0, length:0 }와 { t:1, length:total } 두 entry를 반환한다', () => {
    const out: { t: number; length: number }[] = [];
    const result = quadraticLookupTableInto(out, flatQuadraticFromLegacyPoints(LINE_P0, LINE_P1, LINE_P2), 2);
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ t: 0, length: 0 });
    // steps=2 chord = start→end 직선거리 = 2
    expect(out[1].t).toBe(1);
    expect(out[1].length).toBeCloseTo(2, 10);
  });

  it('첫 entry는 t=0/length=0, 마지막 entry는 t=1이다', () => {
    const out: { t: number; length: number }[] = [];
    quadraticLookupTableInto(out, flatQuadraticFromLegacyPoints(CURVE_P0, CURVE_P1, CURVE_P2), 8);
    expect(out).toHaveLength(8);
    expect(out[0]).toEqual({ t: 0, length: 0 });
    expect(out[7].t).toBe(1);
  });

  it('직선 Bezier에서 마지막 length가 end-start Euclidean distance와 같다', () => {
    const out: { t: number; length: number }[] = [];
    quadraticLookupTableInto(out, flatQuadraticFromLegacyPoints(LINE_P0, LINE_P1, LINE_P2), 9);
    expect(out[out.length - 1].length).toBeCloseTo(2, 10);
  });

  it('굽은 Bezier에서 length가 nondecreasing이다', () => {
    const out: { t: number; length: number }[] = [];
    quadraticLookupTableInto(out, flatQuadraticFromLegacyPoints(CURVE_P0, CURVE_P1, CURVE_P2), 16);
    for (let i = 1; i < out.length; i++) {
      expect(out[i].length).toBeGreaterThanOrEqual(out[i - 1].length);
    }
  });

  it('굽은 Bezier에서 chord 누적은 exact arc length를 underestimate한다 (approximation)', () => {
    const out: { t: number; length: number }[] = [];
    quadraticLookupTableInto(out, flatQuadraticFromLegacyPoints(CURVE_P0, CURVE_P1, CURVE_P2), 4);
    const exact = quadraticLength(flatQuadraticFromLegacyPoints(CURVE_P0, CURVE_P1, CURVE_P2));
    const approx = out[out.length - 1].length;
    expect(approx).toBeGreaterThan(0);
    expect(approx).toBeLessThan(exact);
  });

  it('steps를 늘리면 chord 누적이 exact arc length에 더 가까워진다', () => {
    const coarse: { t: number; length: number }[] = [];
    const fine: { t: number; length: number }[] = [];
    quadraticLookupTableInto(coarse, flatQuadraticFromLegacyPoints(CURVE_P0, CURVE_P1, CURVE_P2), 3);
    quadraticLookupTableInto(fine, flatQuadraticFromLegacyPoints(CURVE_P0, CURVE_P1, CURVE_P2), 64);
    expect(fine[fine.length - 1].length).toBeGreaterThan(coarse[coarse.length - 1].length);
  });

  it('zero-length curve는 모든 length가 0이다', () => {
    const out: { t: number; length: number }[] = [];
    const p = { x: 3, y: 7 };
    quadraticLookupTableInto(out, flatQuadraticFromLegacyPoints(p, p, p), 5);
    expect(out).toHaveLength(5);
    for (const entry of out) {
      expect(entry.length).toBe(0);
    }
    expect(out[0].t).toBe(0);
    expect(out[4].t).toBe(1);
  });

  it('steps=1 (< 2)이면 RangeError를 던진다', () => {
    const out: { t: number; length: number }[] = [];
    expect(() => quadraticLookupTableInto(out, flatQuadraticFromLegacyPoints(LINE_P0, LINE_P1, LINE_P2), 1)).toThrow(
      RangeError
    );
  });

  it('fractional steps (1.5)이면 RangeError를 던진다', () => {
    const out: { t: number; length: number }[] = [];
    expect(() => quadraticLookupTableInto(out, flatQuadraticFromLegacyPoints(LINE_P0, LINE_P1, LINE_P2), 1.5)).toThrow(
      RangeError
    );
  });

  it('NaN steps이면 RangeError를 던진다', () => {
    const out: { t: number; length: number }[] = [];
    expect(() =>
      quadraticLookupTableInto(out, flatQuadraticFromLegacyPoints(LINE_P0, LINE_P1, LINE_P2), Number.NaN)
    ).toThrow(RangeError);
  });

  it('steps > 0xffffffff이면 RangeError를 던진다', () => {
    const out: { t: number; length: number }[] = [];
    expect(() =>
      quadraticLookupTableInto(out, flatQuadraticFromLegacyPoints(LINE_P0, LINE_P1, LINE_P2), 0x100000000)
    ).toThrow(RangeError);
  });

  it('steps validation 실패 시 기존 out 내용을 보존한다', () => {
    const existing = { t: 9, length: 9 };
    const out: { t: number; length: number }[] = [existing];
    expect(() => quadraticLookupTableInto(out, flatQuadraticFromLegacyPoints(LINE_P0, LINE_P1, LINE_P2), 1)).toThrow(
      RangeError
    );
    expect(out).toHaveLength(1);
    expect(out[0]).toBe(existing);
  });

  it('NaN 좌표는 length로 pass-through된다', () => {
    const out: { t: number; length: number }[] = [];
    quadraticLookupTableInto(out, flatQuadraticFromLegacyPoints({ x: Number.NaN, y: 0 }, LINE_P1, LINE_P2), 3);
    expect(out[0].length).toBe(0);
    expect(Number.isNaN(out[2].length)).toBe(true);
  });

  it('Infinity 좌표는 length를 non-finite로 만든다', () => {
    const out: { t: number; length: number }[] = [];
    quadraticLookupTableInto(
      out,
      flatQuadraticFromLegacyPoints(LINE_P0, LINE_P1, { x: Number.POSITIVE_INFINITY, y: 0 }),
      3
    );
    // 첫 entry length는 항상 0(누적 시작). t=0의 0*Infinity=NaN과 sample 차분의 Inf-Inf=NaN으로
    // 이후 누적 length는 non-finite가 된다.
    expect(out[0].length).toBe(0);
    expect(Number.isFinite(out[2].length)).toBe(false);
  });
});

describe('quadraticLookupTable', () => {
  it('quadraticLookupTableInto와 deep equal 결과를 반환한다', () => {
    const into: { t: number; length: number }[] = [];
    quadraticLookupTableInto(into, flatQuadraticFromLegacyPoints(CURVE_P0, CURVE_P1, CURVE_P2), 7);
    const companion = quadraticLookupTable(flatQuadraticFromLegacyPoints(CURVE_P0, CURVE_P1, CURVE_P2), 7);
    expect(companion).toEqual(into);
  });

  it('steps validation 실패 시 RangeError를 던진다', () => {
    expect(() => quadraticLookupTable(flatQuadraticFromLegacyPoints(LINE_P0, LINE_P1, LINE_P2), 1)).toThrow(RangeError);
  });
});
