/**
 * generic curve relation facade *Into 단위 테스트.
 *
 * S2-RM-028: lineCurve / segmentCurve / curveCurve / curveSelf facade가 기존 전용 kernel과
 * flat shape 기준 동치 결과를 내는지, result가 nested `point` 없이 `CurveIntersectionHit` flat
 * shape인지 검증한다. line/segment는 `tLine`/`tCurve`, curve/self는 `tA`/`tB`를 기록한다.
 */

import { describe, expect, test } from 'vitest';
import { cubicCubicIntersectionsInto } from '../../../src/curve/cubic-cubic-intersections-into';
import { cubicLineIntersectionsInto } from '../../../src/curve/cubic-line-intersections-into';
import { cubicSelfIntersectionsInto } from '../../../src/curve/cubic-self-intersections-into';
import { quadraticCubicIntersectionsInto } from '../../../src/curve/quadratic-cubic-intersections-into';
import { quadraticLineIntersectionsInto } from '../../../src/curve/quadratic-line-intersections-into';
import { quadraticQuadraticIntersectionsInto } from '../../../src/curve/quadratic-quadratic-intersections-into';
import { curveCurveIntersectionsInto } from '../../../src/intersects/curve-curve-intersections-into';
import { curveSelfIntersectionsInto } from '../../../src/intersects/curve-self-intersections-into';
import { lineCurveIntersectionsInto } from '../../../src/intersects/line-curve-intersections-into';
import { segmentCurveIntersectionsInto } from '../../../src/intersects/segment-curve-intersections-into';
import type { CurveIntersectionHit, IntersectionHit } from '../../../src/types';
import type { Curve } from '../../../src/types/flat-shapes.internal';

// quadratic 아치: p0=(0,0), p1=(0.5,2), p2=(1,0) — y=0.5 line과 두 점에서 교차, x(t)=t
const QUADRATIC: Curve = { kind: 'quadratic', x0: 0, y0: 0, x1: 0.5, y1: 2, x2: 1, y2: 0 };

// cubic 아치: p0=(0,0), p1=(0,1), p2=(1,1), p3=(1,0) — y=0.5 line과 두 점에서 교차
const CUBIC: Curve = { kind: 'cubic', x0: 0, y0: 0, x1: 0, y1: 1, x2: 1, y2: 1, x3: 1, y3: 0 };

// ─────────────────────────────────────────────────────────────────────────────
// lineCurveIntersectionsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('lineCurveIntersectionsInto', () => {
  test('quadratic 결과가 기존 quadraticLine kernel과 flat shape 기준 동치다', () => {
    const line = { ox: 0, oy: 0.5, dx: 1, dy: 0 };
    const ref: IntersectionHit[] = [];
    quadraticLineIntersectionsInto(ref, QUADRATIC, line);

    const out: CurveIntersectionHit[] = [];
    lineCurveIntersectionsInto(out, line, QUADRATIC);

    expect(out).toHaveLength(ref.length);
    expect(out).toHaveLength(2);
    for (let i = 0; i < out.length; i++) {
      expect(out[i].x).toBeCloseTo(ref[i].point.x, 10);
      expect(out[i].y).toBeCloseTo(ref[i].point.y, 10);
      expect(out[i].tLine).toBeCloseTo(ref[i].tA, 10);
      expect(out[i].tCurve).toBeCloseTo(ref[i].tB, 10);
      expect(out[i].kind).toBe(ref[i].kind);
    }
  });

  test('cubic 결과가 기존 cubicLine kernel과 flat shape 기준 동치다', () => {
    const line = { ox: 0, oy: 0.5, dx: 1, dy: 0 };
    const ref: IntersectionHit[] = [];
    cubicLineIntersectionsInto(ref, CUBIC, line);

    const out: CurveIntersectionHit[] = [];
    lineCurveIntersectionsInto(out, line, CUBIC);

    expect(out).toHaveLength(ref.length);
    expect(out.length).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < out.length; i++) {
      expect(out[i].x).toBeCloseTo(ref[i].point.x, 10);
      expect(out[i].y).toBeCloseTo(ref[i].point.y, 10);
      expect(out[i].tLine).toBeCloseTo(ref[i].tA, 10);
      expect(out[i].tCurve).toBeCloseTo(ref[i].tB, 10);
    }
  });

  test('result에 point field가 없고 tLine/tCurve가 있다', () => {
    const line = { ox: 0, oy: 0.5, dx: 1, dy: 0 };
    const out: CurveIntersectionHit[] = [];
    lineCurveIntersectionsInto(out, line, QUADRATIC);

    expect(out.length).toBeGreaterThan(0);
    for (const hit of out) {
      expect('point' in hit).toBe(false);
      expect('tA' in hit).toBe(false);
      expect('tB' in hit).toBe(false);
      expect(typeof hit.tLine).toBe('number');
      expect(typeof hit.tCurve).toBe('number');
    }
  });

  test('zero direction line은 빈 결과를 낸다', () => {
    const out: CurveIntersectionHit[] = [];
    lineCurveIntersectionsInto(out, { ox: 0, oy: 0.5, dx: 0, dy: 0 }, QUADRATIC);
    expect(out).toHaveLength(0);
  });

  test('out을 호출 전 내용에서 비우고 시작한다', () => {
    const line = { ox: 0, oy: 0.5, dx: 1, dy: 0 };
    const out: CurveIntersectionHit[] = [{ x: 99, y: 99, kind: 'cross' }];
    lineCurveIntersectionsInto(out, line, QUADRATIC);
    expect(out).toHaveLength(2);
    expect(out.some((h) => h.x === 99 && h.y === 99)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// segmentCurveIntersectionsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('segmentCurveIntersectionsInto', () => {
  test('segment 전체를 덮으면 quadratic 두 교차점을 모두 반환한다', () => {
    const segment = { x1: 0, y1: 0.5, x2: 1, y2: 0.5 };
    const out: CurveIntersectionHit[] = [];
    segmentCurveIntersectionsInto(out, segment, QUADRATIC);
    expect(out).toHaveLength(2);
    for (const hit of out) {
      expect(hit.tLine).toBeGreaterThanOrEqual(0);
      expect(hit.tLine).toBeLessThanOrEqual(1);
      expect(hit.y).toBeCloseTo(0.5, 6);
    }
  });

  test('segment parameter [0,1] 밖 hit를 제거한다', () => {
    // quadratic 교차점은 x≈0.146, 0.854. segment A=(0.8,0.5) B=(1.5,0.5)는 x≈0.854만 포함한다.
    const segment = { x1: 0.8, y1: 0.5, x2: 1.5, y2: 0.5 };
    const out: CurveIntersectionHit[] = [];
    segmentCurveIntersectionsInto(out, segment, QUADRATIC);
    expect(out).toHaveLength(1);
    for (const hit of out) {
      expect(hit.tLine).toBeGreaterThanOrEqual(0);
      expect(hit.tLine).toBeLessThanOrEqual(1);
    }
    expect(out[0].x).toBeCloseTo(0.854, 2);
  });

  test('cubic도 segment range 내 hit만 반환한다', () => {
    const segment = { x1: 0, y1: 0.5, x2: 1, y2: 0.5 };
    const out: CurveIntersectionHit[] = [];
    segmentCurveIntersectionsInto(out, segment, CUBIC);
    expect(out.length).toBeGreaterThanOrEqual(1);
    for (const hit of out) {
      expect(hit.tLine).toBeGreaterThanOrEqual(0);
      expect(hit.tLine).toBeLessThanOrEqual(1);
      expect(hit.y).toBeCloseTo(0.5, 5);
    }
  });

  test('segment가 curve를 지나지 않으면 빈 결과다', () => {
    const segment = { x1: 5, y1: 0.5, x2: 6, y2: 0.5 };
    const out: CurveIntersectionHit[] = [];
    segmentCurveIntersectionsInto(out, segment, CUBIC);
    expect(out).toHaveLength(0);
  });

  test('zero-length segment는 빈 결과를 낸다', () => {
    const segment = { x1: 0, y1: 0.5, x2: 0, y2: 0.5 };
    const out: CurveIntersectionHit[] = [];
    segmentCurveIntersectionsInto(out, segment, QUADRATIC);
    expect(out).toHaveLength(0);
  });

  test('result에 point field가 없고 tLine/tCurve가 있다', () => {
    const segment = { x1: 0, y1: 0.5, x2: 1, y2: 0.5 };
    const out: CurveIntersectionHit[] = [];
    segmentCurveIntersectionsInto(out, segment, QUADRATIC);
    for (const hit of out) {
      expect('point' in hit).toBe(false);
      expect(typeof hit.tLine).toBe('number');
      expect(typeof hit.tCurve).toBe('number');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// curveCurveIntersectionsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('curveCurveIntersectionsInto', () => {
  // quadratic A: 위로 볼록 아치
  const QA = { kind: 'quadratic', x0: 0, y0: 0, x1: 0.5, y1: 2, x2: 1, y2: 0 } as const satisfies Curve;
  // quadratic B: 아래로 볼록 — A와 두 점에서 교차
  const QB = { kind: 'quadratic', x0: 0, y0: 1, x1: 0.5, y1: -1, x2: 1, y2: 1 } as const satisfies Curve;
  // cubic B: y≈1 수평 — A와 정점에서 접촉
  const CB = { kind: 'cubic', x0: 0, y0: 1, x1: 0.3, y1: 1, x2: 0.7, y2: 1, x3: 1, y3: 1 } as const satisfies Curve;

  test('quadratic × quadratic 결과가 기존 kernel과 동치다', () => {
    const ref: IntersectionHit[] = [];
    quadraticQuadraticIntersectionsInto(ref, QA, QB);

    const out: CurveIntersectionHit[] = [];
    curveCurveIntersectionsInto(out, QA, QB);

    expect(out).toHaveLength(ref.length);
    expect(out.length).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < out.length; i++) {
      expect(out[i].x).toBeCloseTo(ref[i].point.x, 8);
      expect(out[i].y).toBeCloseTo(ref[i].point.y, 8);
      expect(out[i].tA).toBeCloseTo(ref[i].tA, 8);
      expect(out[i].tB).toBeCloseTo(ref[i].tB, 8);
    }
  });

  test('quadratic × cubic 결과가 기존 kernel과 동치다', () => {
    const ref: IntersectionHit[] = [];
    quadraticCubicIntersectionsInto(ref, QA, CB);

    const out: CurveIntersectionHit[] = [];
    curveCurveIntersectionsInto(out, QA, CB);

    expect(out).toHaveLength(ref.length);
    expect(out.length).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < out.length; i++) {
      expect(out[i].x).toBeCloseTo(ref[i].point.x, 8);
      expect(out[i].y).toBeCloseTo(ref[i].point.y, 8);
      expect(out[i].tA).toBeCloseTo(ref[i].tA, 8);
      expect(out[i].tB).toBeCloseTo(ref[i].tB, 8);
    }
  });

  test('cubic × quadratic은 caller order에 맞게 tA/tB를 swap한다', () => {
    // 기준: quadraticCubic(quadratic=QA, cubic=CB) → tA=quadratic param, tB=cubic param
    const ref: IntersectionHit[] = [];
    quadraticCubicIntersectionsInto(ref, QA, CB);

    // facade는 (cubic=CB, quadratic=QA) 순서 — tA=cubic param, tB=quadratic param이어야 한다
    const out: CurveIntersectionHit[] = [];
    curveCurveIntersectionsInto(out, CB, QA);

    expect(out).toHaveLength(ref.length);
    for (let i = 0; i < out.length; i++) {
      expect(out[i].x).toBeCloseTo(ref[i].point.x, 8);
      expect(out[i].y).toBeCloseTo(ref[i].point.y, 8);
      // caller order swap: out.tA(cubic) == ref.tB(cubic), out.tB(quadratic) == ref.tA(quadratic)
      expect(out[i].tA).toBeCloseTo(ref[i].tB, 8);
      expect(out[i].tB).toBeCloseTo(ref[i].tA, 8);
    }
  });

  test('cubic × cubic 결과가 기존 kernel과 동치다', () => {
    const ca = { kind: 'cubic', x0: 0, y0: 0, x1: 0.3, y1: 1, x2: 0.7, y2: 1, x3: 1, y3: 0 } as const satisfies Curve;
    const cb = {
      kind: 'cubic',
      x0: 0,
      y0: 0.5,
      x1: 0.3,
      y1: 0.5,
      x2: 0.7,
      y2: 0.5,
      x3: 1,
      y3: 0.5,
    } as const satisfies Curve;
    const ref: IntersectionHit[] = [];
    cubicCubicIntersectionsInto(ref, ca, cb);

    const out: CurveIntersectionHit[] = [];
    curveCurveIntersectionsInto(out, ca, cb);

    expect(out).toHaveLength(ref.length);
    expect(out).toHaveLength(2);
    for (let i = 0; i < out.length; i++) {
      expect(out[i].x).toBeCloseTo(ref[i].point.x, 8);
      expect(out[i].y).toBeCloseTo(ref[i].point.y, 8);
      expect(out[i].tA).toBeCloseTo(ref[i].tA, 8);
      expect(out[i].tB).toBeCloseTo(ref[i].tB, 8);
    }
  });

  test('겹치지 않으면 빈 결과다', () => {
    const ca = { kind: 'quadratic', x0: 0, y0: 5, x1: 0.5, y1: 6, x2: 1, y2: 5 } as const satisfies Curve;
    const cb = { kind: 'quadratic', x0: 0, y0: 0, x1: 0.5, y1: -1, x2: 1, y2: 0 } as const satisfies Curve;
    const out: CurveIntersectionHit[] = [];
    curveCurveIntersectionsInto(out, ca, cb);
    expect(out).toHaveLength(0);
  });

  test('result에 point field가 없고 tA/tB가 있다', () => {
    const out: CurveIntersectionHit[] = [];
    curveCurveIntersectionsInto(out, QA, QB);
    expect(out.length).toBeGreaterThan(0);
    for (const hit of out) {
      expect('point' in hit).toBe(false);
      expect('tLine' in hit).toBe(false);
      expect('tCurve' in hit).toBe(false);
      expect(typeof hit.tA).toBe('number');
      expect(typeof hit.tB).toBe('number');
    }
  });

  test('out을 호출 전 내용에서 비우고 시작한다', () => {
    const out: CurveIntersectionHit[] = [{ x: 99, y: 99, kind: 'cross', tA: 0, tB: 0 }];
    curveCurveIntersectionsInto(out, QA, QB);
    expect(out.some((h) => h.x === 99 && h.y === 99)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// curveSelfIntersectionsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('curveSelfIntersectionsInto', () => {
  // loop cubic: 자기 교차점 보유
  const LOOP = { kind: 'cubic', x0: 0, y0: 0, x1: 2, y1: 2, x2: -2, y2: 2, x3: 2, y3: 0 } as const satisfies Curve;

  test('self-intersecting cubic 결과가 기존 kernel과 동치다', () => {
    const ref: IntersectionHit[] = [];
    cubicSelfIntersectionsInto(ref, LOOP);

    const out: CurveIntersectionHit[] = [];
    curveSelfIntersectionsInto(out, LOOP);

    expect(out).toHaveLength(ref.length);
    expect(out.length).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < out.length; i++) {
      expect(out[i].x).toBeCloseTo(ref[i].point.x, 8);
      expect(out[i].y).toBeCloseTo(ref[i].point.y, 8);
      expect(out[i].tA).toBeCloseTo(ref[i].tA, 8);
      expect(out[i].tB).toBeCloseTo(ref[i].tB, 8);
    }
  });

  test('non-self-intersecting cubic은 빈 결과다', () => {
    const sCurve = { kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 2, x2: 2, y2: -2, x3: 3, y3: 0 } as const satisfies Curve;
    const out: CurveIntersectionHit[] = [];
    curveSelfIntersectionsInto(out, sCurve);
    expect(out).toHaveLength(0);
  });

  test('quadratic은 빈 결과다', () => {
    const out: CurveIntersectionHit[] = [];
    curveSelfIntersectionsInto(out, QUADRATIC);
    expect(out).toHaveLength(0);
  });

  test('result에 point field가 없고 tA/tB가 있다 (tLine/tCurve 없음)', () => {
    const out: CurveIntersectionHit[] = [];
    curveSelfIntersectionsInto(out, LOOP);
    expect(out.length).toBeGreaterThan(0);
    for (const hit of out) {
      expect('point' in hit).toBe(false);
      expect('tLine' in hit).toBe(false);
      expect('tCurve' in hit).toBe(false);
      expect(typeof hit.tA).toBe('number');
      expect(typeof hit.tB).toBe('number');
    }
  });

  test('self hit는 tA < tB 순서를 유지한다', () => {
    const out: CurveIntersectionHit[] = [];
    curveSelfIntersectionsInto(out, LOOP);
    expect(out.length).toBeGreaterThan(0);
    for (const hit of out) {
      expect(hit.tA).toBeLessThan(hit.tB as number);
    }
  });
});
