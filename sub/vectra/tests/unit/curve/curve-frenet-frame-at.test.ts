/**
 * curveFrenetFrameAtInto / curveFrenetFrameAt unit test.
 *
 * 검증 방법:
 * - quadratic/cubic frame이 기존 point/tangent/normal/curvature leaf와 같은 값이다.
 * - degenerate, t 외삽, companion, tuple/object input, aliasing, non-finite pass-through를 검증한다.
 */

import { describe, expect, it } from 'vitest';
import { cubicCurvatureAt } from '../../../src/curve/cubic-curvature-at';
import { cubicNormalAtInto } from '../../../src/curve/cubic-normal-at-into';
import { cubicPointAtTInto } from '../../../src/curve/cubic-point-at-t-into';
import { cubicTangentAtInto } from '../../../src/curve/cubic-tangent-at-into';
import { curveFrenetFrameAt } from '../../../src/curve/curve-frenet-frame-at';
import { curveFrenetFrameAtInto } from '../../../src/curve/curve-frenet-frame-at-into';
import { quadraticCurvatureAt } from '../../../src/curve/quadratic-curvature-at';
import { quadraticNormalAtInto } from '../../../src/curve/quadratic-normal-at-into';
import { quadraticPointAtTInto } from '../../../src/curve/quadratic-point-at-t-into';
import { quadraticTangentAtInto } from '../../../src/curve/quadratic-tangent-at-into';
import type { CurveFrenetFrameResult, CurveLike } from '../../../src/types';

function makeOut(): CurveFrenetFrameResult {
  return {
    point: { x: 0, y: 0 },
    tangent: { x: 0, y: 0 },
    normal: { x: 0, y: 0 },
    curvature: 0,
  };
}

describe('curveFrenetFrameAtInto - quadratic', () => {
  const quad: CurveLike = { kind: 'quadratic', p0: { x: 0, y: 0 }, p1: { x: 1, y: 1 }, p2: { x: 2, y: 0 } };

  it('기존 quadratic leaf와 같은 point/tangent/normal/curvature다', () => {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const out = makeOut();
      curveFrenetFrameAtInto(out, quad, t);

      const pt = quadraticPointAtTInto({ x: 0, y: 0 }, quad.p0, quad.p1, quad.p2, t);
      const tan = quadraticTangentAtInto({ x: 0, y: 0 }, quad.p0, quad.p1, quad.p2, t);
      const nrm = quadraticNormalAtInto({ x: 0, y: 0 }, quad.p0, quad.p1, quad.p2, t);
      const kappa = quadraticCurvatureAt(quad.p0, quad.p1, quad.p2, t);

      expect(out.point.x).toBeCloseTo(pt.x, 12);
      expect(out.point.y).toBeCloseTo(pt.y, 12);
      expect(out.tangent.x).toBeCloseTo(tan.x, 12);
      expect(out.tangent.y).toBeCloseTo(tan.y, 12);
      expect(out.normal.x).toBeCloseTo(nrm.x, 12);
      expect(out.normal.y).toBeCloseTo(nrm.y, 12);
      expect(out.curvature).toBeCloseTo(kappa, 12);
    }
  });

  it('straight quadratic은 curvature가 0이다', () => {
    const straight: CurveLike = { kind: 'quadratic', p0: { x: 0, y: 0 }, p1: { x: 1, y: 0 }, p2: { x: 2, y: 0 } };
    const out = makeOut();
    curveFrenetFrameAtInto(out, straight, 0.5);
    expect(out.point.x).toBeCloseTo(1, 12);
    expect(out.point.y).toBeCloseTo(0, 12);
    expect(out.tangent.x).toBeCloseTo(1, 12);
    expect(out.tangent.y).toBeCloseTo(0, 12);
    expect(out.normal.x).toBeCloseTo(0, 12);
    expect(out.normal.y).toBeCloseTo(1, 12);
    expect(out.curvature).toBe(0);
  });

  it('curved quadratic은 curvature 부호와 non-zero 값을 가진다', () => {
    const out = makeOut();
    curveFrenetFrameAtInto(out, quad, 0.5);
    // d1=(2,0), d2=(0,-4) → curvature = (2*-4 - 0*0)/2^3 = -1
    expect(out.curvature).toBeCloseTo(-1, 12);
  });

  it('normal은 tangent의 좌측 90도 회전 (-ty, tx)다', () => {
    const out = makeOut();
    curveFrenetFrameAtInto(out, quad, 0.3);
    expect(out.normal.x).toBeCloseTo(-out.tangent.y, 12);
    expect(out.normal.y).toBeCloseTo(out.tangent.x, 12);
  });
});

describe('curveFrenetFrameAtInto - cubic', () => {
  const cubic: CurveLike = {
    kind: 'cubic',
    p0: { x: 0, y: 0 },
    p1: { x: 1, y: 2 },
    p2: { x: 3, y: 2 },
    p3: { x: 4, y: 0 },
  };

  it('기존 cubic leaf와 같은 point/tangent/normal/curvature다', () => {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const out = makeOut();
      curveFrenetFrameAtInto(out, cubic, t);

      const pt = cubicPointAtTInto({ x: 0, y: 0 }, cubic.p0, cubic.p1, cubic.p2, cubic.p3, t);
      const tan = cubicTangentAtInto({ x: 0, y: 0 }, cubic.p0, cubic.p1, cubic.p2, cubic.p3, t);
      const nrm = cubicNormalAtInto({ x: 0, y: 0 }, cubic.p0, cubic.p1, cubic.p2, cubic.p3, t);
      const kappa = cubicCurvatureAt(cubic.p0, cubic.p1, cubic.p2, cubic.p3, t);

      expect(out.point.x).toBeCloseTo(pt.x, 12);
      expect(out.point.y).toBeCloseTo(pt.y, 12);
      expect(out.tangent.x).toBeCloseTo(tan.x, 12);
      expect(out.tangent.y).toBeCloseTo(tan.y, 12);
      expect(out.normal.x).toBeCloseTo(nrm.x, 12);
      expect(out.normal.y).toBeCloseTo(nrm.y, 12);
      expect(out.curvature).toBeCloseTo(kappa, 12);
    }
  });
});

describe('curveFrenetFrameAtInto - degenerate', () => {
  it('모든 control point가 같은 quadratic은 point=p0, tangent/normal zero, curvature 0', () => {
    const degen: CurveLike = { kind: 'quadratic', p0: { x: 5, y: 7 }, p1: { x: 5, y: 7 }, p2: { x: 5, y: 7 } };
    const out = makeOut();
    curveFrenetFrameAtInto(out, degen, 0.5);
    expect(out.point.x).toBe(5);
    expect(out.point.y).toBe(7);
    expect(out.tangent.x).toBe(0);
    expect(out.tangent.y).toBe(0);
    expect(out.normal.x).toBe(0);
    expect(out.normal.y).toBe(0);
    expect(out.curvature).toBe(0);
    // degenerate에서 signed -0 누출이 없다 (Object.is로 -0/+0 구분)
    expect(Object.is(out.tangent.x, 0)).toBe(true);
    expect(Object.is(out.normal.y, 0)).toBe(true);
  });

  it('모든 control point가 같은 cubic은 point=p0, tangent/normal zero, curvature 0', () => {
    const degen: CurveLike = {
      kind: 'cubic',
      p0: { x: 5, y: 7 },
      p1: { x: 5, y: 7 },
      p2: { x: 5, y: 7 },
      p3: { x: 5, y: 7 },
    };
    const out = makeOut();
    curveFrenetFrameAtInto(out, degen, 0.5);
    expect(out.point.x).toBe(5);
    expect(out.point.y).toBe(7);
    expect(out.tangent.x).toBe(0);
    expect(out.tangent.y).toBe(0);
    expect(out.normal.x).toBe(0);
    expect(out.normal.y).toBe(0);
    expect(out.curvature).toBe(0);
  });
});

describe('curveFrenetFrameAtInto - t 외삽', () => {
  const cubic: CurveLike = {
    kind: 'cubic',
    p0: { x: 0, y: 0 },
    p1: { x: 1, y: 2 },
    p2: { x: 3, y: 2 },
    p3: { x: 4, y: 0 },
  };

  it('t<0, t>1에서 clamp 없이 외삽 point를 반환한다', () => {
    for (const t of [-0.5, 1.5]) {
      const out = makeOut();
      curveFrenetFrameAtInto(out, cubic, t);
      const pt = cubicPointAtTInto({ x: 0, y: 0 }, cubic.p0, cubic.p1, cubic.p2, cubic.p3, t);
      expect(out.point.x).toBeCloseTo(pt.x, 12);
      expect(out.point.y).toBeCloseTo(pt.y, 12);
    }
  });
});

describe('curveFrenetFrameAtInto - non-finite pass-through', () => {
  for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    it(`p1.x=${bad}이면 산술 결과를 pass-through한다`, () => {
      const curve: CurveLike = { kind: 'quadratic', p0: { x: 0, y: 0 }, p1: { x: bad, y: 1 }, p2: { x: 2, y: 0 } };
      const out = makeOut();
      curveFrenetFrameAtInto(out, curve, 0.5);
      expect(Number.isFinite(out.point.x)).toBe(false);
      // len = hypot(NaN/Infinity, ...) = NaN/Infinity → tangent non-finite
      expect(Number.isFinite(out.tangent.x)).toBe(false);
      // curvature도 non-finite로 흐른다 (degenerate 0으로 오인하지 않는다)
      expect(Number.isFinite(out.curvature)).toBe(false);
    });
  }

  for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    it(`cubic p3.y=${bad}이면 산술 결과를 pass-through한다`, () => {
      const curve: CurveLike = {
        kind: 'cubic',
        p0: { x: 0, y: 0 },
        p1: { x: 1, y: 2 },
        p2: { x: 3, y: 2 },
        p3: { x: 4, y: bad },
      };
      const out = makeOut();
      curveFrenetFrameAtInto(out, curve, 0.5);
      expect(Number.isFinite(out.point.y)).toBe(false);
      expect(Number.isFinite(out.tangent.y)).toBe(false);
      expect(Number.isFinite(out.curvature)).toBe(false);
    });
  }

  it('t=NaN이면 point가 NaN이다', () => {
    const curve: CurveLike = { kind: 'quadratic', p0: { x: 0, y: 0 }, p1: { x: 1, y: 1 }, p2: { x: 2, y: 0 } };
    const out = makeOut();
    curveFrenetFrameAtInto(out, curve, Number.NaN);
    expect(Number.isNaN(out.point.x)).toBe(true);
  });
});

describe('curveFrenetFrameAtInto - tuple/object input', () => {
  it('tuple input과 object input이 같은 결과다', () => {
    const objCurve: CurveLike = {
      kind: 'cubic',
      p0: { x: 0, y: 0 },
      p1: { x: 1, y: 2 },
      p2: { x: 3, y: 2 },
      p3: { x: 4, y: 0 },
    };
    const tupleCurve: CurveLike = { kind: 'cubic', p0: [0, 0], p1: [1, 2], p2: [3, 2], p3: [4, 0] };
    const a = makeOut();
    const b = makeOut();
    curveFrenetFrameAtInto(a, objCurve, 0.4);
    curveFrenetFrameAtInto(b, tupleCurve, 0.4);
    expect(b.point.x).toBeCloseTo(a.point.x, 12);
    expect(b.point.y).toBeCloseTo(a.point.y, 12);
    expect(b.tangent.x).toBeCloseTo(a.tangent.x, 12);
    expect(b.curvature).toBeCloseTo(a.curvature, 12);
  });

  it('tuple writable output에 기록한다', () => {
    const out = {
      point: [0, 0] as [number, number],
      tangent: [0, 0] as [number, number],
      normal: [0, 0] as [number, number],
      curvature: 0,
    };
    const curve: CurveLike = { kind: 'quadratic', p0: { x: 0, y: 0 }, p1: { x: 1, y: 1 }, p2: { x: 2, y: 0 } };
    curveFrenetFrameAtInto(out, curve, 0.5);
    expect(out.point[0]).toBeCloseTo(1, 12);
    expect(out.point[1]).toBeCloseTo(0.5, 12);
  });
});

describe('curveFrenetFrameAtInto - aliasing', () => {
  it('out.point가 input point와 같은 object여도 기준값과 같다', () => {
    const sharedP0 = { x: 0, y: 0 };
    const curve: CurveLike = { kind: 'quadratic', p0: sharedP0, p1: { x: 1, y: 1 }, p2: { x: 2, y: 0 } };
    const out: CurveFrenetFrameResult = {
      point: sharedP0,
      tangent: { x: 0, y: 0 },
      normal: { x: 0, y: 0 },
      curvature: 0,
    };
    curveFrenetFrameAtInto(out, curve, 0.5);

    const ref = makeOut();
    curveFrenetFrameAtInto(ref, { kind: 'quadratic', p0: { x: 0, y: 0 }, p1: { x: 1, y: 1 }, p2: { x: 2, y: 0 } }, 0.5);
    expect(out.point.x).toBeCloseTo(ref.point.x, 12);
    expect(out.point.y).toBeCloseTo(ref.point.y, 12);
    expect(out.tangent.x).toBeCloseTo(ref.tangent.x, 12);
    expect(out.curvature).toBeCloseTo(ref.curvature, 12);
  });

  it('out을 반환한다', () => {
    const out = makeOut();
    const curve: CurveLike = { kind: 'quadratic', p0: { x: 0, y: 0 }, p1: { x: 1, y: 1 }, p2: { x: 2, y: 0 } };
    expect(curveFrenetFrameAtInto(out, curve, 0.5)).toBe(out);
  });
});

describe('curveFrenetFrameAt', () => {
  const curve: CurveLike = {
    kind: 'cubic',
    p0: { x: 0, y: 0 },
    p1: { x: 1, y: 2 },
    p2: { x: 3, y: 2 },
    p3: { x: 4, y: 0 },
  };

  it('nested plain object를 반환한다', () => {
    const result = curveFrenetFrameAt(curve, 0.5);
    expect(typeof result.point.x).toBe('number');
    expect(typeof result.tangent.y).toBe('number');
    expect(typeof result.normal.x).toBe('number');
    expect(typeof result.curvature).toBe('number');
  });

  it('curveFrenetFrameAtInto와 같은 값을 반환한다', () => {
    const result = curveFrenetFrameAt(curve, 0.5);
    const out = makeOut();
    curveFrenetFrameAtInto(out, curve, 0.5);
    expect(result.point.x).toBeCloseTo(out.point.x, 12);
    expect(result.tangent.x).toBeCloseTo(out.tangent.x, 12);
    expect(result.normal.y).toBeCloseTo(out.normal.y, 12);
    expect(result.curvature).toBeCloseTo(out.curvature, 12);
  });
});
