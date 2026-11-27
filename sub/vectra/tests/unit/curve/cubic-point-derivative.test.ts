import { flatCubicFromLegacyPoints } from '../../../src/internal/legacy-curve.internal';
import { describe, expect, it } from 'vitest';
import { cubicDerivativeAtInto } from '../../../src/curve/cubic-derivative-at-into';
import { cubicNormalAtInto } from '../../../src/curve/cubic-normal-at-into';
import { cubicPointAtT } from '../../../src/curve/cubic-point-at-t';
import { cubicPointAtTInto } from '../../../src/curve/cubic-point-at-t-into';
import { cubicSecondDerivativeAtInto } from '../../../src/curve/cubic-second-derivative-at-into';
import { cubicTangentAtInto } from '../../../src/curve/cubic-tangent-at-into';

function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

describe('cubicPointAtTInto', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 3 };
  const p2 = { x: 3, y: 3 };
  const p3 = { x: 4, y: 0 };

  it('t=0이면 p0을 반환한다', () => {
    const out = { x: 0, y: 0 };
    cubicPointAtTInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0);
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  it('t=1이면 p3을 반환한다', () => {
    const out = { x: 0, y: 0 };
    cubicPointAtTInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 1);
    expect(out.x).toBe(4);
    expect(out.y).toBe(0);
  });

  it('t=0.5 정확값을 반환한다', () => {
    const out = { x: 0, y: 0 };
    cubicPointAtTInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    expect(relErr(out.x, 2.0)).toBeLessThan(1e-12);
    expect(relErr(out.y, 2.25)).toBeLessThan(1e-12);
  });

  it('out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const ret = cubicPointAtTInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    expect(ret).toBe(out);
  });
});

describe('cubicPointAtT', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 3 };
  const p2 = { x: 3, y: 3 };
  const p3 = { x: 4, y: 0 };

  it('cubicPointAtTInto와 같은 좌표를 새 object로 반환한다', () => {
    const expected = cubicPointAtTInto({ x: 0, y: 0 }, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    const result = cubicPointAtT(flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    expect(result).toEqual(expected);
  });

  it('t는 clamp하지 않고 외삽 결과를 반환한다', () => {
    const expected = cubicPointAtTInto({ x: 0, y: 0 }, flatCubicFromLegacyPoints(p0, p1, p2, p3), 1.5);
    const result = cubicPointAtT(flatCubicFromLegacyPoints(p0, p1, p2, p3), 1.5);
    expect(result).toEqual(expected);
  });

  it('입력 point를 재사용하지 않는 fresh plain object를 반환한다', () => {
    const result = cubicPointAtT(flatCubicFromLegacyPoints(p0, p1, p2, p3), 0);
    expect(result).not.toBe(p0);
    expect(Array.isArray(result)).toBe(false);
    expect(result).toEqual({ x: 0, y: 0 });
  });
});

describe('cubicDerivativeAtInto', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 3 };
  const p2 = { x: 3, y: 3 };
  const p3 = { x: 4, y: 0 };

  it('t=0에서 endpoint derivative를 반환한다', () => {
    const out = { x: 0, y: 0 };
    cubicDerivativeAtInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0);
    expect(relErr(out.x, 3)).toBeLessThan(1e-12);
    expect(relErr(out.y, 9)).toBeLessThan(1e-12);
  });

  it('t=1에서 endpoint derivative를 반환한다', () => {
    const out = { x: 0, y: 0 };
    cubicDerivativeAtInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 1);
    expect(relErr(out.x, 3)).toBeLessThan(1e-12);
    expect(relErr(out.y, -9)).toBeLessThan(1e-12);
  });

  it('직선 cubic에서 모든 t에서 일정한 derivative를 반환한다', () => {
    const out = { x: 0, y: 0 };
    cubicDerivativeAtInto(out, { kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 1, x2: 2, y2: 2, x3: 3, y3: 3 }, 0.5);
    expect(relErr(out.x, 3)).toBeLessThan(1e-12);
    expect(relErr(out.y, 3)).toBeLessThan(1e-12);
  });

  it('out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const ret = cubicDerivativeAtInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0);
    expect(ret).toBe(out);
  });
});

describe('cubicSecondDerivativeAtInto', () => {
  it('직선 cubic에서 zero vector를 반환한다', () => {
    const out = { x: 0, y: 0 };
    cubicSecondDerivativeAtInto(out, { kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 1, x2: 2, y2: 2, x3: 3, y3: 3 }, 0.5);
    expect(Math.abs(out.x)).toBeLessThan(1e-12);
    expect(Math.abs(out.y)).toBeLessThan(1e-12);
  });

  it('t=0에서 정확값을 반환한다', () => {
    const out = { x: 0, y: 0 };
    cubicSecondDerivativeAtInto(out, { kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 3, x2: 3, y2: 3, x3: 4, y3: 0 }, 0);
    expect(relErr(out.x, 6)).toBeLessThan(1e-12);
    expect(relErr(out.y, -18)).toBeLessThan(1e-12);
  });

  it('out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const ret = cubicSecondDerivativeAtInto(
      out,
      { kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 3, x2: 3, y2: 3, x3: 4, y3: 0 },
      0
    );
    expect(ret).toBe(out);
  });
});

describe('cubicTangentAtInto', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 3 };
  const p2 = { x: 3, y: 3 };
  const p3 = { x: 4, y: 0 };

  it('정상 curve에서 unit tangent를 반환한다 (길이 ≈ 1)', () => {
    const out = { x: 0, y: 0 };
    cubicTangentAtInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0);
    const len = Math.hypot(out.x, out.y);
    expect(relErr(len, 1)).toBeLessThan(1e-12);
  });

  it('degenerate curve (p0==p1==p2==p3)에서 zero vector를 반환한다', () => {
    const out = { x: 1, y: 1 };
    const p = { x: 5, y: 5 };
    cubicTangentAtInto(out, flatCubicFromLegacyPoints(p, p, p, p), 0.5);
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  it('out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const ret = cubicTangentAtInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0);
    expect(ret).toBe(out);
  });
});

describe('cubicNormalAtInto', () => {
  it('unit normal의 길이가 1에 근사한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 3 };
    const p2 = { x: 3, y: 3 };
    const p3 = { x: 4, y: 0 };
    const out = { x: 0, y: 0 };
    cubicNormalAtInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    const len = Math.hypot(out.x, out.y);
    expect(relErr(len, 1)).toBeLessThan(1e-12);
  });

  it('tangent와 normal의 내적이 0에 근사한다 (수직)', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 3 };
    const p2 = { x: 3, y: 3 };
    const p3 = { x: 4, y: 0 };
    const normal = { x: 0, y: 0 };
    const tangent = { x: 0, y: 0 };
    cubicNormalAtInto(normal, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    cubicTangentAtInto(tangent, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    const dot = normal.x * tangent.x + normal.y * tangent.y;
    expect(Math.abs(dot)).toBeLessThan(1e-12);
  });

  it('수평 직선 cubic에서 normal이 (0, ±1)이다', () => {
    const out = { x: 0, y: 0 };
    cubicNormalAtInto(out, { kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 0, x2: 2, y2: 0, x3: 3, y3: 0 }, 0.5);
    expect(Math.abs(out.x)).toBeLessThan(1e-12);
    expect(relErr(Math.abs(out.y), 1)).toBeLessThan(1e-12);
  });

  it('degenerate curve에서 zero vector를 반환한다', () => {
    const out = { x: 1, y: 1 };
    const p = { x: 5, y: 5 };
    cubicNormalAtInto(out, flatCubicFromLegacyPoints(p, p, p, p), 0.5);
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  it('out을 반환한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 3 };
    const p2 = { x: 3, y: 3 };
    const p3 = { x: 4, y: 0 };
    const out = { x: 0, y: 0 };
    const ret = cubicNormalAtInto(out, flatCubicFromLegacyPoints(p0, p1, p2, p3), 0.5);
    expect(ret).toBe(out);
  });
});
