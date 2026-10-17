import { describe, expect, it } from 'vitest';
import { cubicBounds } from '../../../src/curve/cubic-bounds';
import { cubicBoundsInto } from '../../../src/curve/cubic-bounds-into';
import { cubicExtrema } from '../../../src/curve/cubic-extrema';

function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

describe('cubicExtrema', () => {
  it('단조 증가 cubic에서 interior extrema가 없다', () => {
    const result = cubicExtrema({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 });
    expect(result.length).toBe(0);
  });

  it('x 방향 interior extrema가 있는 경우 t ∈ (0,1) 값을 반환한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 6, y: 0 };
    const p2 = { x: 0, y: 0 };
    const p3 = { x: 2, y: 0 };
    const result = cubicExtrema(p0, p1, p2, p3);
    expect(result.length).toBeGreaterThan(0);
    for (const t of result) {
      expect(t).toBeGreaterThan(0);
      expect(t).toBeLessThan(1);
    }
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThan(result[i - 1]);
    }
  });

  it('y방향 interior extrema가 있는 curve에서 올바른 t를 반환한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 4 };
    const p2 = { x: 3, y: 4 };
    const p3 = { x: 4, y: 0 };
    const result = cubicExtrema(p0, p1, p2, p3);
    const hasHalf = result.some((t) => relErr(t, 0.5) < 1e-10);
    expect(hasHalf).toBe(true);
  });

  it('x, y 방향 모두 interior extrema가 있는 경우 2개 이상 반환하고 오름차순이다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 6, y: 0 };
    const p2 = { x: 0, y: 4 };
    const p3 = { x: 4, y: 0 };
    const result = cubicExtrema(p0, p1, p2, p3);
    expect(result.length).toBeGreaterThanOrEqual(2);
    for (const t of result) {
      expect(t).toBeGreaterThan(0);
      expect(t).toBeLessThan(1);
    }
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThan(result[i - 1]);
    }
  });

  it('오름차순 정렬이다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 4 };
    const p2 = { x: 3, y: 4 };
    const p3 = { x: 4, y: 0 };
    const result = cubicExtrema(p0, p1, p2, p3);
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]);
    }
  });

  it('모든 t ∈ (0,1)이다 (endpoint 제외)', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 4 };
    const p2 = { x: 3, y: 4 };
    const p3 = { x: 4, y: 0 };
    const result = cubicExtrema(p0, p1, p2, p3);
    for (const t of result) {
      expect(t).toBeGreaterThan(0);
      expect(t).toBeLessThan(1);
    }
  });
});

describe('cubicBoundsInto', () => {
  it('단조 cubic의 bounds는 endpoint로만 결정된다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    cubicBoundsInto(out, { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 });
    expect(out.min.x).toBe(0);
    expect(out.min.y).toBe(0);
    expect(out.max.x).toBe(3);
    expect(out.max.y).toBe(3);
  });

  it('y 방향 interior extrema가 bounds.max.y를 확장한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 4 };
    const p2 = { x: 3, y: 4 };
    const p3 = { x: 4, y: 0 };
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    cubicBoundsInto(out, p0, p1, p2, p3);
    expect(out.max.y).toBeGreaterThan(0);
    expect(out.min.x).toBe(0);
    expect(out.max.x).toBe(4);
  });

  it('x 방향 interior extrema가 bounds를 확장한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 6, y: 0 };
    const p2 = { x: 0, y: 0 };
    const p3 = { x: 2, y: 0 };
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    cubicBoundsInto(out, p0, p1, p2, p3);
    expect(out.max.x).toBeGreaterThan(2);
  });

  it('out을 반환한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    const ret = cubicBoundsInto(out, { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 });
    expect(ret).toBe(out);
  });
});

describe('cubicBoundsInto - 좌표 scale 불변성', () => {
  // x(t)는 interior 극소 t = 1 - √2/2 에서 -(√2 - 1)/2 · s, y(t)는 t = 0.5 에서 극대 0.375 · s를 갖는다.
  const MIN_X = -(Math.SQRT2 - 1) / 2;

  it.each([1e-8, 1e-7, 1e-5, 1, 1e8])('좌표 scale %s에서도 interior extrema가 bounds에 반영된다', (s) => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    cubicBoundsInto(out, { x: 0, y: 0 }, { x: -0.5 * s, y: 0.5 * s }, { x: 0, y: 0.5 * s }, { x: 0.5 * s, y: 0 });
    expect(relErr(out.min.x, MIN_X * s)).toBeLessThan(1e-12);
    expect(relErr(out.max.x, 0.5 * s)).toBeLessThan(1e-12);
    expect(out.min.y).toBe(0);
    expect(relErr(out.max.y, 0.375 * s)).toBeLessThan(1e-12);
  });

  it.each([1e-8, 1e-7, 1, 1e8])('좌표 scale %s에서 cubicExtrema의 t는 scale과 무관하다', (s) => {
    const t = cubicExtrema({ x: 0, y: 0 }, { x: -0.5 * s, y: 0.5 * s }, { x: 0, y: 0.5 * s }, { x: 0.5 * s, y: 0 });
    expect(t).toHaveLength(2);
    expect(relErr(t[0] as number, 1 - Math.SQRT1_2)).toBeLessThan(1e-12);
    expect(relErr(t[1] as number, 0.5)).toBeLessThan(1e-12);
  });
});

describe('cubicBounds', () => {
  it('interior extrema cubic에서 cubicBoundsInto와 같은 bounds를 새 object로 반환한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 4 };
    const p2 = { x: 3, y: 4 };
    const p3 = { x: 4, y: 0 };
    const expected = cubicBoundsInto({ min: { x: 0, y: 0 }, max: { x: 0, y: 0 } }, p0, p1, p2, p3);
    const result = cubicBounds(p0, p1, p2, p3);
    expect(result).toEqual(expected);
  });

  it('직선(degenerate) cubic의 bounds는 endpoint로만 결정된다', () => {
    const result = cubicBounds({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 });
    expect(result.min).toEqual({ x: 0, y: 0 });
    expect(result.max).toEqual({ x: 3, y: 3 });
  });

  it('fresh top-level bounds와 fresh min/max point object를 반환한다', () => {
    const a = cubicBounds({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 });
    const b = cubicBounds({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 });
    expect(a).not.toBe(b);
    expect(a.min).not.toBe(a.max);
    expect(a.min).not.toBe(b.min);
    expect(a.max).not.toBe(b.max);
  });
});
