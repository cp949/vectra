/**
 * reduceBezierDegreeInto가 차수 올림으로 만든 cubic을 원본 quadratic으로 되돌리는지 검증한다.
 * 일반 cubic은 기본 tolerance에서 실패하고 out을 바꾸지 않는다.
 * tolerance 조정, 잘못된 tolerance의 RangeError, non-finite 좌표의 false 반환을 다룬다.
 * reduceBezierDegree는 성공하면 새 객체, 실패하면 undefined를 돌려준다.
 */
import { describe, expect, it } from 'vitest';
import { quadraticElevateToCubic } from '../../../src/curve/quadratic-elevate-to-cubic';
import { reduceBezierDegree } from '../../../src/curve/reduce-bezier-degree';
import { reduceBezierDegreeInto } from '../../../src/curve/reduce-bezier-degree-into';
import { flatQuadraticFromLegacyPoints, flatCubicFromLegacyPoints } from '../_helpers/curve-fixtures';

/**
 * out 인자로 넘길 0 초기값 평평한 quadratic 객체를 만든다.
 * 실패 시 out 불변을 보는 시험은 0이 아닌 값을 따로 쓴다.
 */
function makeQuadOut() {
  return { kind: 'quadratic' as const, x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
}

// 정확히 quadratic에서 elevation된 cubic을 만든다
const q0 = { x: 0, y: 0 };
const q1 = { x: 2, y: 6 };
const q2 = { x: 8, y: 0 };
const elevated = quadraticElevateToCubic(flatQuadraticFromLegacyPoints(q0, q1, q2));

// 명백히 quadratic으로 환원되지 않는 일반 cubic
const g0 = { x: 0, y: 0 };
const g1 = { x: 0, y: 10 };
const g2 = { x: 10, y: 10 };
const g3 = { x: 10, y: 0 };

describe('reduceBezierDegreeInto', () => {
  it('정확히 elevated된 cubic을 원본 quadratic으로 복원한다', () => {
    const out = makeQuadOut();
    const ok = reduceBezierDegreeInto(out, elevated);
    expect(ok).toBe(true);
    expect(out.x0).toBeCloseTo(q0.x, 12);
    expect(out.y0).toBeCloseTo(q0.y, 12);
    expect(out.x1).toBeCloseTo(q1.x, 9);
    expect(out.y1).toBeCloseTo(q1.y, 9);
    expect(out.x2).toBeCloseTo(q2.x, 12);
    expect(out.y2).toBeCloseTo(q2.y, 12);
  });

  it('endpoints는 cubic endpoints로 보존한다', () => {
    const out = makeQuadOut();
    reduceBezierDegreeInto(out, elevated);
    expect(out.x0).toBe(elevated.x0);
    expect(out.y0).toBe(elevated.y0);
    expect(out.x2).toBe(elevated.x3);
    expect(out.y2).toBe(elevated.y3);
  });

  it('일반 cubic은 기본 tolerance에서 실패한다', () => {
    const out = makeQuadOut();
    const ok = reduceBezierDegreeInto(out, flatCubicFromLegacyPoints(g0, g1, g2, g3));
    expect(ok).toBe(false);
  });

  it('실패 시 out은 미수정이다', () => {
    const out = { kind: 'quadratic' as const, x0: -1, y0: -1, x1: -2, y1: -2, x2: -3, y2: -3 };
    const ok = reduceBezierDegreeInto(out, flatCubicFromLegacyPoints(g0, g1, g2, g3));
    expect(ok).toBe(false);
    expect(out.x0).toBe(-1);
    expect(out.y0).toBe(-1);
    expect(out.x1).toBe(-2);
    expect(out.y1).toBe(-2);
    expect(out.x2).toBe(-3);
    expect(out.y2).toBe(-3);
  });

  it('loose tolerance에서는 실패하던 cubic이 성공한다', () => {
    const out = makeQuadOut();
    const ok = reduceBezierDegreeInto(out, flatCubicFromLegacyPoints(g0, g1, g2, g3), { tolerance: 10 });
    expect(ok).toBe(true);
    // q1 = ((3*g1 - g0) + (3*g2 - g3)) / 4
    expect(out.x1).toBeCloseTo((3 * g1.x - g0.x + (3 * g2.x - g3.x)) / 4, 12);
    expect(out.y1).toBeCloseTo((3 * g1.y - g0.y + (3 * g2.y - g3.y)) / 4, 12);
  });

  it('tolerance 0이면 정확히 elevated된 cubic만 성공한다', () => {
    const out = makeQuadOut();
    const ok = reduceBezierDegreeInto(out, elevated, { tolerance: 0 });
    expect(ok).toBe(true);
  });

  it('negative tolerance는 RangeError다', () => {
    const out = makeQuadOut();
    expect(() => reduceBezierDegreeInto(out, flatCubicFromLegacyPoints(g0, g1, g2, g3), { tolerance: -1 })).toThrow(
      RangeError
    );
  });

  it('non-finite tolerance는 RangeError다', () => {
    const out = makeQuadOut();
    expect(() =>
      reduceBezierDegreeInto(out, flatCubicFromLegacyPoints(g0, g1, g2, g3), { tolerance: Number.NaN })
    ).toThrow(RangeError);
    expect(() =>
      reduceBezierDegreeInto(out, flatCubicFromLegacyPoints(g0, g1, g2, g3), { tolerance: Number.POSITIVE_INFINITY })
    ).toThrow(RangeError);
  });

  it('non-finite 좌표는 false다 (out 미수정)', () => {
    const out = { kind: 'quadratic' as const, x0: 7, y0: 7, x1: 7, y1: 7, x2: 7, y2: 7 };
    const ok = reduceBezierDegreeInto(out, flatCubicFromLegacyPoints({ x: Number.NaN, y: 0 }, g1, g2, g3));
    expect(ok).toBe(false);
    expect(out.x0).toBe(7);
    expect(out.y0).toBe(7);
  });

  it('Infinity 좌표는 false다', () => {
    const out = makeQuadOut();
    const ok = reduceBezierDegreeInto(
      out,
      flatCubicFromLegacyPoints({ x: Number.POSITIVE_INFINITY, y: 0 }, g1, g2, g3)
    );
    expect(ok).toBe(false);
  });

  it('-Infinity 좌표는 false다 (p0 아닌 위치, out 미수정)', () => {
    const out = { kind: 'quadratic' as const, x0: 7, y0: 7, x1: 7, y1: 7, x2: 7, y2: 7 };
    const ok = reduceBezierDegreeInto(
      out,
      flatCubicFromLegacyPoints(g0, { x: Number.NEGATIVE_INFINITY, y: 0 }, g2, g3)
    );
    expect(ok).toBe(false);
    expect(out.x0).toBe(7);
    expect(out.y0).toBe(7);
  });
});

describe('reduceBezierDegree', () => {
  it('성공 시 plain object { p0, p1, p2 }를 반환한다', () => {
    const result = reduceBezierDegree(elevated);
    expect(result).toBeDefined();
    expect(typeof result?.x0).toBe('number');
    expect(typeof result?.y1).toBe('number');
    expect(typeof result?.x2).toBe('number');
  });

  it('reduceBezierDegreeInto와 같은 값을 반환한다', () => {
    const result = reduceBezierDegree(elevated);
    const out = makeQuadOut();
    reduceBezierDegreeInto(out, elevated);
    expect(result?.x1).toBeCloseTo(out.x1, 12);
    expect(result?.y1).toBeCloseTo(out.y1, 12);
  });

  it('실패 시 undefined를 반환한다', () => {
    const result = reduceBezierDegree(flatCubicFromLegacyPoints(g0, g1, g2, g3));
    expect(result).toBeUndefined();
  });

  it('negative/non-finite tolerance는 RangeError를 전파한다', () => {
    expect(() => reduceBezierDegree(flatCubicFromLegacyPoints(g0, g1, g2, g3), { tolerance: -1 })).toThrow(RangeError);
    expect(() => reduceBezierDegree(flatCubicFromLegacyPoints(g0, g1, g2, g3), { tolerance: Number.NaN })).toThrow(
      RangeError
    );
  });
});
