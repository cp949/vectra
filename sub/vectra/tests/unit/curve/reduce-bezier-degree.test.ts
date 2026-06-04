/**
 * reduceBezierDegreeInto / reduceBezierDegree unit test.
 *
 * 검증 방법:
 * - 정확히 elevated된 cubic은 원본 quadratic control point로 복원된다.
 * - 일반 cubic은 기본 tolerance에서 실패하고 out이 미수정이다.
 * - tolerance override, RangeError, companion, tuple/object input, aliasing을 검증한다.
 */

import { describe, expect, it } from 'vitest';
import { quadraticElevateToCubic } from '../../../src/curve/quadratic-elevate-to-cubic';
import { reduceBezierDegree } from '../../../src/curve/reduce-bezier-degree';
import { reduceBezierDegreeInto } from '../../../src/curve/reduce-bezier-degree-into';

function makeQuadOut() {
  return {
    p0: { x: 0, y: 0 },
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 0 },
  };
}

// 정확히 quadratic에서 elevation된 cubic을 만든다
const q0 = { x: 0, y: 0 };
const q1 = { x: 2, y: 6 };
const q2 = { x: 8, y: 0 };
const elevated = quadraticElevateToCubic(q0, q1, q2);

// 명백히 quadratic으로 환원되지 않는 일반 cubic
const g0 = { x: 0, y: 0 };
const g1 = { x: 0, y: 10 };
const g2 = { x: 10, y: 10 };
const g3 = { x: 10, y: 0 };

describe('reduceBezierDegreeInto', () => {
  it('정확히 elevated된 cubic을 원본 quadratic으로 복원한다', () => {
    const out = makeQuadOut();
    const ok = reduceBezierDegreeInto(out, elevated.p0, elevated.p1, elevated.p2, elevated.p3);
    expect(ok).toBe(true);
    expect(out.p0.x).toBeCloseTo(q0.x, 12);
    expect(out.p0.y).toBeCloseTo(q0.y, 12);
    expect(out.p1.x).toBeCloseTo(q1.x, 9);
    expect(out.p1.y).toBeCloseTo(q1.y, 9);
    expect(out.p2.x).toBeCloseTo(q2.x, 12);
    expect(out.p2.y).toBeCloseTo(q2.y, 12);
  });

  it('endpoints는 cubic endpoints로 보존한다', () => {
    const out = makeQuadOut();
    reduceBezierDegreeInto(out, elevated.p0, elevated.p1, elevated.p2, elevated.p3);
    expect(out.p0.x).toBe(elevated.p0.x);
    expect(out.p0.y).toBe(elevated.p0.y);
    expect(out.p2.x).toBe(elevated.p3.x);
    expect(out.p2.y).toBe(elevated.p3.y);
  });

  it('일반 cubic은 기본 tolerance에서 실패한다', () => {
    const out = makeQuadOut();
    const ok = reduceBezierDegreeInto(out, g0, g1, g2, g3);
    expect(ok).toBe(false);
  });

  it('실패 시 out은 미수정이다', () => {
    const out = {
      p0: { x: -1, y: -1 },
      p1: { x: -2, y: -2 },
      p2: { x: -3, y: -3 },
    };
    const ok = reduceBezierDegreeInto(out, g0, g1, g2, g3);
    expect(ok).toBe(false);
    expect(out.p0).toEqual({ x: -1, y: -1 });
    expect(out.p1).toEqual({ x: -2, y: -2 });
    expect(out.p2).toEqual({ x: -3, y: -3 });
  });

  it('loose tolerance에서는 실패하던 cubic이 성공한다', () => {
    const out = makeQuadOut();
    const ok = reduceBezierDegreeInto(out, g0, g1, g2, g3, { tolerance: 10 });
    expect(ok).toBe(true);
    // q1 = ((3*g1 - g0) + (3*g2 - g3)) / 4
    expect(out.p1.x).toBeCloseTo((3 * g1.x - g0.x + (3 * g2.x - g3.x)) / 4, 12);
    expect(out.p1.y).toBeCloseTo((3 * g1.y - g0.y + (3 * g2.y - g3.y)) / 4, 12);
  });

  it('tolerance 0이면 정확히 elevated된 cubic만 성공한다', () => {
    const out = makeQuadOut();
    const ok = reduceBezierDegreeInto(out, elevated.p0, elevated.p1, elevated.p2, elevated.p3, { tolerance: 0 });
    expect(ok).toBe(true);
  });

  it('negative tolerance는 RangeError다', () => {
    const out = makeQuadOut();
    expect(() => reduceBezierDegreeInto(out, g0, g1, g2, g3, { tolerance: -1 })).toThrow(RangeError);
  });

  it('non-finite tolerance는 RangeError다', () => {
    const out = makeQuadOut();
    expect(() => reduceBezierDegreeInto(out, g0, g1, g2, g3, { tolerance: Number.NaN })).toThrow(RangeError);
    expect(() => reduceBezierDegreeInto(out, g0, g1, g2, g3, { tolerance: Number.POSITIVE_INFINITY })).toThrow(
      RangeError
    );
  });

  it('non-finite 좌표는 false다 (out 미수정)', () => {
    const out = {
      p0: { x: 7, y: 7 },
      p1: { x: 7, y: 7 },
      p2: { x: 7, y: 7 },
    };
    const ok = reduceBezierDegreeInto(out, { x: Number.NaN, y: 0 }, g1, g2, g3);
    expect(ok).toBe(false);
    expect(out.p0).toEqual({ x: 7, y: 7 });
  });

  it('Infinity 좌표는 false다', () => {
    const out = makeQuadOut();
    const ok = reduceBezierDegreeInto(out, { x: Number.POSITIVE_INFINITY, y: 0 }, g1, g2, g3);
    expect(ok).toBe(false);
  });

  it('-Infinity 좌표는 false다 (p0 아닌 위치, out 미수정)', () => {
    const out = {
      p0: { x: 7, y: 7 },
      p1: { x: 7, y: 7 },
      p2: { x: 7, y: 7 },
    };
    const ok = reduceBezierDegreeInto(out, g0, { x: Number.NEGATIVE_INFINITY, y: 0 }, g2, g3);
    expect(ok).toBe(false);
    expect(out.p0).toEqual({ x: 7, y: 7 });
  });

  it('tuple input을 지원한다', () => {
    const out = makeQuadOut();
    const ok = reduceBezierDegreeInto(
      out,
      [elevated.p0.x, elevated.p0.y],
      [elevated.p1.x, elevated.p1.y],
      [elevated.p2.x, elevated.p2.y],
      [elevated.p3.x, elevated.p3.y]
    );
    expect(ok).toBe(true);
    expect(out.p1.x).toBeCloseTo(q1.x, 9);
    expect(out.p1.y).toBeCloseTo(q1.y, 9);
  });

  it('aliasing 안전: out.p0가 input p0와 같은 object여도 정확하다', () => {
    const sharedP0 = { x: elevated.p0.x, y: elevated.p0.y };
    const sharedOut = {
      p0: sharedP0,
      p1: { x: 0, y: 0 },
      p2: { x: 0, y: 0 },
    };
    const ok = reduceBezierDegreeInto(sharedOut, sharedP0, elevated.p1, elevated.p2, elevated.p3);
    expect(ok).toBe(true);
    const ref = makeQuadOut();
    reduceBezierDegreeInto(ref, elevated.p0, elevated.p1, elevated.p2, elevated.p3);
    expect(sharedOut.p1.x).toBeCloseTo(ref.p1.x, 12);
    expect(sharedOut.p1.y).toBeCloseTo(ref.p1.y, 12);
    expect(sharedOut.p2.x).toBeCloseTo(ref.p2.x, 12);
    expect(sharedOut.p2.y).toBeCloseTo(ref.p2.y, 12);
  });
});

describe('reduceBezierDegree', () => {
  it('성공 시 plain object { p0, p1, p2 }를 반환한다', () => {
    const result = reduceBezierDegree(elevated.p0, elevated.p1, elevated.p2, elevated.p3);
    expect(result).toBeDefined();
    expect(typeof result?.p0.x).toBe('number');
    expect(typeof result?.p1.y).toBe('number');
    expect(typeof result?.p2.x).toBe('number');
  });

  it('reduceBezierDegreeInto와 같은 값을 반환한다', () => {
    const result = reduceBezierDegree(elevated.p0, elevated.p1, elevated.p2, elevated.p3);
    const out = makeQuadOut();
    reduceBezierDegreeInto(out, elevated.p0, elevated.p1, elevated.p2, elevated.p3);
    expect(result?.p1.x).toBeCloseTo(out.p1.x, 12);
    expect(result?.p1.y).toBeCloseTo(out.p1.y, 12);
  });

  it('실패 시 undefined를 반환한다', () => {
    const result = reduceBezierDegree(g0, g1, g2, g3);
    expect(result).toBeUndefined();
  });

  it('negative/non-finite tolerance는 RangeError를 전파한다', () => {
    expect(() => reduceBezierDegree(g0, g1, g2, g3, { tolerance: -1 })).toThrow(RangeError);
    expect(() => reduceBezierDegree(g0, g1, g2, g3, { tolerance: Number.NaN })).toThrow(RangeError);
  });
});
