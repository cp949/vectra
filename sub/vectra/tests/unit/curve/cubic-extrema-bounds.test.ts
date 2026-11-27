import { flatCubicFromLegacyPoints } from '../../../src/internal/legacy-curve.internal';
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
    const result = cubicExtrema({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 1, x2: 2, y2: 2, x3: 3, y3: 3 });
    expect(result.length).toBe(0);
  });

  it('x 방향 interior extrema가 있는 경우 t ∈ (0,1) 값을 반환한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 6, y: 0 };
    const p2 = { x: 0, y: 0 };
    const p3 = { x: 2, y: 0 };
    const result = cubicExtrema(flatCubicFromLegacyPoints(p0, p1, p2, p3));
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
    const result = cubicExtrema(flatCubicFromLegacyPoints(p0, p1, p2, p3));
    const hasHalf = result.some((t) => relErr(t, 0.5) < 1e-10);
    expect(hasHalf).toBe(true);
  });

  it('x, y 방향 모두 interior extrema가 있는 경우 2개 이상 반환하고 오름차순이다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 6, y: 0 };
    const p2 = { x: 0, y: 4 };
    const p3 = { x: 4, y: 0 };
    const result = cubicExtrema(flatCubicFromLegacyPoints(p0, p1, p2, p3));
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
    const result = cubicExtrema(flatCubicFromLegacyPoints(p0, p1, p2, p3));
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]);
    }
  });

  it('모든 t ∈ (0,1)이다 (endpoint 제외)', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 4 };
    const p2 = { x: 3, y: 4 };
    const p3 = { x: 4, y: 0 };
    const result = cubicExtrema(flatCubicFromLegacyPoints(p0, p1, p2, p3));
    for (const t of result) {
      expect(t).toBeGreaterThan(0);
      expect(t).toBeLessThan(1);
    }
  });
});

describe('cubicBoundsInto', () => {
  it('단조 cubic의 bounds는 endpoint로만 결정된다', () => {
    const out = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    cubicBoundsInto(out, { kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 1, x2: 2, y2: 2, x3: 3, y3: 3 });
    expect(out.minX).toBe(0);
    expect(out.minY).toBe(0);
    expect(out.maxX).toBe(3);
    expect(out.maxY).toBe(3);
  });

  it('y 방향 interior extrema가 bounds.max.y를 확장한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 4 };
    const p2 = { x: 3, y: 4 };
    const p3 = { x: 4, y: 0 };
    const out = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    cubicBoundsInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3));
    expect(out.maxY).toBeGreaterThan(0);
    expect(out.minX).toBe(0);
    expect(out.maxX).toBe(4);
  });

  it('x 방향 interior extrema가 bounds를 확장한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 6, y: 0 };
    const p2 = { x: 0, y: 0 };
    const p3 = { x: 2, y: 0 };
    const out = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    cubicBoundsInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3));
    expect(out.maxX).toBeGreaterThan(2);
  });

  it('out을 반환한다', () => {
    const out = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    const ret = cubicBoundsInto(out, { kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 1, x2: 2, y2: 2, x3: 3, y3: 3 });
    expect(ret).toBe(out);
  });
});

describe('cubicBoundsInto - 좌표 scale 불변성', () => {
  // x(t)는 interior 극소 t = 1 - √2/2 에서 -(√2 - 1)/2 · s, y(t)는 t = 0.5 에서 극대 0.375 · s를 갖는다.
  const MIN_X = -(Math.SQRT2 - 1) / 2;

  it.each([1e-8, 1e-7, 1e-5, 1, 1e8])('좌표 scale %s에서도 interior extrema가 bounds에 반영된다', (s) => {
    const out = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    cubicBoundsInto(out, {
      kind: 'cubic',
      x0: 0,
      y0: 0,
      x1: -0.5 * s,
      y1: 0.5 * s,
      x2: 0,
      y2: 0.5 * s,
      x3: 0.5 * s,
      y3: 0,
    });
    expect(relErr(out.minX, MIN_X * s)).toBeLessThan(1e-12);
    expect(relErr(out.maxX, 0.5 * s)).toBeLessThan(1e-12);
    expect(out.minY).toBe(0);
    expect(relErr(out.maxY, 0.375 * s)).toBeLessThan(1e-12);
  });

  it.each([1e-8, 1e-7, 1, 1e8])('좌표 scale %s에서 cubicExtrema의 t는 scale과 무관하다', (s) => {
    const t = cubicExtrema({
      kind: 'cubic',
      x0: 0,
      y0: 0,
      x1: -0.5 * s,
      y1: 0.5 * s,
      x2: 0,
      y2: 0.5 * s,
      x3: 0.5 * s,
      y3: 0,
    });
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
    const expected = cubicBoundsInto({ minX: 0, minY: 0, maxX: 0, maxY: 0 }, flatCubicFromLegacyPoints(p0, p1, p2, p3));
    const result = cubicBounds(flatCubicFromLegacyPoints(p0, p1, p2, p3));
    expect(result).toEqual(expected);
  });

  it('직선(degenerate) cubic의 bounds는 endpoint로만 결정된다', () => {
    const result = cubicBounds({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 1, x2: 2, y2: 2, x3: 3, y3: 3 });
    expect(result.minX).toBe(0);
    expect(result.minY).toBe(0);
    expect(result.maxX).toBe(3);
    expect(result.maxY).toBe(3);
  });

  it('호출마다 새 경계 상자 객체를 반환한다', () => {
    const a = cubicBounds({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 1, x2: 2, y2: 2, x3: 3, y3: 3 });
    const b = cubicBounds({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 1, x2: 2, y2: 2, x3: 3, y3: 3 });
    expect(a).not.toBe(b);
  });
});
