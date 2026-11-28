/**
 * cubicFlattenInto의 flatness 단조성, maxRecursion 상한, out 규약을 검증한다.
 * cubicLength가 직선 길이에 근사하고 segments 옵션에 안정적인지 확인한다.
 */
import { describe, expect, it } from 'vitest';
import { cubicFlattenInto } from '../../../src/curve/cubic-flatten-into';
import { cubicLength } from '../../../src/curve/cubic-length';
import { flatCubicFromLegacyPoints } from '../_helpers/curve-fixtures';

/**
 * 기대값 대비 상대 오차를 구한다.
 * 기대값이 0이면 절대 오차를 돌려준다.
 */
function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

describe('cubicFlattenInto', () => {
  it('직선(collinear) cubic에서 시작/끝 두 점만 생성한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 0 };
    const p2 = { x: 2, y: 0 };
    const p3 = { x: 3, y: 0 };
    const out: { x: number; y: number }[] = [];
    cubicFlattenInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3));
    expect(out.length).toBe(2);
    expect(out[0].x).toBe(0);
    expect(out[out.length - 1].x).toBe(3);
  });

  it('flatness가 작을수록 point 수가 증가한다 (단조성)', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 5 };
    const p2 = { x: 3, y: 5 };
    const p3 = { x: 4, y: 0 };

    const out1: { x: number; y: number }[] = [];
    cubicFlattenInto(out1, flatCubicFromLegacyPoints(p0, p1, p2, p3), { flatness: 1.0, maxRecursion: 32 });

    const out2: { x: number; y: number }[] = [];
    cubicFlattenInto(out2, flatCubicFromLegacyPoints(p0, p1, p2, p3), { flatness: 0.1, maxRecursion: 32 });

    expect(out2.length).toBeGreaterThanOrEqual(out1.length);
  });

  it('maxRecursion을 존중한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 100 };
    const p2 = { x: 3, y: 100 };
    const p3 = { x: 4, y: 0 };
    const out: { x: number; y: number }[] = [];
    cubicFlattenInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), { flatness: 0.001, maxRecursion: 2 });
    expect(out.length).toBeLessThanOrEqual(9);
  });

  it('기존 내용을 clear 후 push한다', () => {
    const sentinel = { x: 99, y: 99 };
    const out = [sentinel];
    cubicFlattenInto(out, { kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 0, x2: 2, y2: 0, x3: 3, y3: 0 });
    expect(out[0]).not.toBe(sentinel);
  });

  it('out을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const ret = cubicFlattenInto(out, { kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 0, x2: 2, y2: 0, x3: 3, y3: 0 });
    expect(ret).toBe(out);
  });
});

describe('cubicLength', () => {
  it('직선 cubic의 길이가 정확한 직선 길이에 근사한다', () => {
    const len = cubicLength({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 0, x2: 2, y2: 0, x3: 3, y3: 0 });
    expect(Math.abs(len - 3)).toBeLessThan(1e-6);
  });

  it('대각선 직선 cubic의 길이가 정확하다', () => {
    const len = cubicLength({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 1, x2: 2, y2: 2, x3: 3, y3: 3 });
    const expected = 3 * Math.SQRT2;
    expect(Math.abs(len - expected) / expected).toBeLessThan(1e-6);
  });

  it('symmetric curve의 길이 근사가 합리적 tolerance 내에 있다', () => {
    const len = cubicLength({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 4, x2: 3, y2: 4, x3: 4, y3: 0 });
    expect(len).toBeGreaterThan(4);
    expect(len).toBeLessThan(11);
  });

  it('segments 옵션을 변경해도 일관된 결과를 반환한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 4 };
    const p2 = { x: 3, y: 4 };
    const p3 = { x: 4, y: 0 };
    const len12 = cubicLength(flatCubicFromLegacyPoints(p0, p1, p2, p3), { segments: 12 });
    const len24 = cubicLength(flatCubicFromLegacyPoints(p0, p1, p2, p3), { segments: 24 });
    expect(relErr(len12, len24)).toBeLessThan(1e-4);
  });
});
