/**
 * quadraticClosestLocation / cubicClosestLocation unit test.
 *
 * 검증 방법:
 * - 직선 Bezier에서 수직 발(foot) 위치 및 t와 비교한다.
 * - curve 밖의 점에서 endpoint(t=0 / t=1)가 최근접점인 경우.
 * - 대칭 case에서 t=0.5 위치 점이 최근접점.
 * - 동거리 query에서 작은 t를 선택하는 tie-break.
 * - 모든 control point가 같은 degenerate point curve.
 * - tuple XYInput을 받는다.
 * - distance와 distanceSquared 일관성: `distance ** 2 ≈ distanceSquared`.
 * - sampleCount invalid 정책: 정수가 아니거나 2 미만이거나 non-finite이면 endpoint만 비교한다.
 * - tolerance/maxIterations invalid 정책: 정책상 invalid이면 default로 fallback한다 (maxIterations=Infinity hang 회피 포함).
 * - oversized finite 좌표에서 distanceSquared가 Infinity여도 result는 반환한다.
 * - 기존 quadraticClosestPointInto / cubicClosestPointInto와 회귀 일치 (S2-RM-020).
 */

import { describe, expect, it } from 'vitest';
import { cubicClosestLocation } from '../../../src/curve/cubic-closest-location';
import { cubicClosestPointInto } from '../../../src/curve/cubic-closest-point-into';
import { quadraticClosestLocation } from '../../../src/curve/quadratic-closest-location';
import { quadraticClosestPointInto } from '../../../src/curve/quadratic-closest-point-into';

function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

// quadratic Bezier evaluator
function quadEval(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  t: number
): { x: number; y: number } {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  };
}

// cubic Bezier evaluator
function cubicEval(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
): { x: number; y: number } {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return {
    x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
    y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y,
  };
}

describe('quadraticClosestLocation', () => {
  it('직선 Bezier에서 수직 발과 t가 일치한다', () => {
    // p0=(0,0) p1=(5,0) p2=(10,0): 직선. query=(5,3) → 발=(5,0), t≈0.5
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 5, y: 0 };
    const p2 = { x: 10, y: 0 };
    const result = quadraticClosestLocation(p0, p1, p2, { x: 5, y: 3 });
    expect(relErr(result.point.x, 5)).toBeLessThan(1e-6);
    expect(Math.abs(result.point.y)).toBeLessThan(1e-6);
    expect(relErr(result.t, 0.5)).toBeLessThan(1e-6);
    expect(relErr(result.distance, 3)).toBeLessThan(1e-6);
  });

  it('query가 시작점 너머에 있으면 t=0이고 시작점이 결과다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 2 };
    const p2 = { x: 4, y: 0 };
    const result = quadraticClosestLocation(p0, p1, p2, { x: -10, y: 0 });
    expect(result.t).toBe(0);
    expect(result.point).toEqual({ x: 0, y: 0 });
    expect(relErr(result.distance, 10)).toBeLessThan(1e-12);
  });

  it('query가 끝점 너머에 있으면 t=1이고 끝점이 결과다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 2 };
    const p2 = { x: 4, y: 0 };
    const result = quadraticClosestLocation(p0, p1, p2, { x: 100, y: 0 });
    expect(result.t).toBe(1);
    expect(result.point).toEqual({ x: 4, y: 0 });
    expect(relErr(result.distance, 96)).toBeLessThan(1e-12);
  });

  it('대칭 curve 위쪽 query는 t=0.5에서 최근접이다', () => {
    // p0=(0,0) p1=(2,4) p2=(4,0): 대칭 포물선. t=0.5 → (2,2). query=(2,10)
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 2, y: 4 };
    const p2 = { x: 4, y: 0 };
    const result = quadraticClosestLocation(p0, p1, p2, { x: 2, y: 10 });
    expect(relErr(result.t, 0.5)).toBeLessThan(1e-5);
    expect(relErr(result.point.x, 2)).toBeLessThan(1e-5);
    expect(relErr(result.point.y, 2)).toBeLessThan(1e-5);
  });

  it('tie-break: 동거리에서 작은 t를 선택한다', () => {
    // 진짜 동률을 발동하려면 모든 t에서 거리가 같아야 한다.
    // degenerate point curve(모든 control이 같은 점)에서 query가 그 점이면 모든 t에서 거리=0.
    // 알고리즘은 endpoint t=0을 best로 초기화하고 strict `<` 비교라 모든 sample이 갱신을
    // 일으키지 않는다 → t=0이 결정적으로 선택된다.
    const p = { x: 1, y: 0 };
    const result = quadraticClosestLocation(p, p, p, { x: 1, y: 0 });
    expect(result.distance).toBeLessThan(1e-12);
    expect(result.t).toBe(0);
  });

  it('degenerate point curve (모든 control이 같은 점)에서 거리와 t를 반환한다', () => {
    const p = { x: 3, y: 4 };
    const result = quadraticClosestLocation(p, p, p, { x: 0, y: 0 });
    expect(Math.abs(result.point.x - 3)).toBeLessThan(1e-12);
    expect(Math.abs(result.point.y - 4)).toBeLessThan(1e-12);
    // 모든 control이 같은 점이라 모든 t에서 거리가 동일. tie-break으로 t=0이 결정된다.
    expect(result.t).toBe(0);
    expect(relErr(result.distance, 5)).toBeLessThan(1e-12);
    expect(relErr(result.distanceSquared, 25)).toBeLessThan(1e-12);
  });

  it('tuple XYInput을 받는다', () => {
    const r1 = quadraticClosestLocation({ x: 0, y: 0 }, { x: 2, y: 3 }, { x: 4, y: 0 }, { x: 3, y: 2 });
    const r2 = quadraticClosestLocation([0, 0], [2, 3], [4, 0], [3, 2]);
    expect(Math.abs(r1.point.x - r2.point.x)).toBeLessThan(1e-10);
    expect(Math.abs(r1.point.y - r2.point.y)).toBeLessThan(1e-10);
    expect(Math.abs(r1.t - r2.t)).toBeLessThan(1e-10);
    expect(Math.abs(r1.distance - r2.distance)).toBeLessThan(1e-10);
  });

  it('distance ** 2 ≈ distanceSquared', () => {
    const result = quadraticClosestLocation({ x: 0, y: 0 }, { x: 1, y: 3 }, { x: 5, y: 1 }, { x: 2, y: 2 });
    const sqOfDist = result.distance * result.distance;
    expect(Math.abs(sqOfDist - result.distanceSquared)).toBeLessThan(Math.max(1, result.distanceSquared) * 1e-12);
  });

  it('result.point가 curve(t)와 일치한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 4 };
    const p2 = { x: 6, y: 2 };
    const result = quadraticClosestLocation(p0, p1, p2, { x: 3, y: 1 });
    const evald = quadEval(p0, p1, p2, result.t);
    expect(Math.abs(result.point.x - evald.x)).toBeLessThan(1e-9);
    expect(Math.abs(result.point.y - evald.y)).toBeLessThan(1e-9);
  });

  it('sampleCount=1이면 endpoint 두 점만 비교한다', () => {
    // 대칭 curve p0=(0,0) p1=(2,4) p2=(4,0), query=(2,10)
    // interior t=0.5는 (2,2)로 거리≈8. endpoint t=0은 거리≈√(4+100)≈10.2, t=1은 같다.
    // sampleCount=1이면 interior를 탐색하지 않으므로 endpoint 중 하나가 결과.
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 2, y: 4 };
    const p2 = { x: 4, y: 0 };
    const result = quadraticClosestLocation(p0, p1, p2, { x: 2, y: 10 }, { sampleCount: 1 });
    // endpoint 두 점 (0,0)과 (4,0)은 query=(2,10)에 대해 정확히 동거리.
    // tie-break으로 t=0이 선택된다.
    expect(result.t === 0 || result.t === 1).toBe(true);
    // interior minimum (2,2)는 거리≈8이지만 sampleCount=1이면 탐색되지 않으므로
    // 결과 거리는 endpoint 거리(>10) 수준이어야 한다.
    expect(result.distance).toBeGreaterThan(10);
  });

  it('sampleCount=0이면 endpoint 두 점만 비교한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 2, y: 4 };
    const p2 = { x: 4, y: 0 };
    const result = quadraticClosestLocation(p0, p1, p2, { x: 2, y: 10 }, { sampleCount: 0 });
    expect(result.t === 0 || result.t === 1).toBe(true);
    expect(result.distance).toBeGreaterThan(10);
  });

  it('sampleCount=NaN이면 endpoint 두 점만 비교한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 2, y: 4 };
    const p2 = { x: 4, y: 0 };
    const result = quadraticClosestLocation(p0, p1, p2, { x: 2, y: 10 }, { sampleCount: Number.NaN });
    expect(result.t === 0 || result.t === 1).toBe(true);
    expect(result.distance).toBeGreaterThan(10);
  });

  it('sampleCount=Infinity이면 endpoint 두 점만 비교한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 2, y: 4 };
    const p2 = { x: 4, y: 0 };
    const result = quadraticClosestLocation(
      p0,
      p1,
      p2,
      { x: 2, y: 10 },
      {
        sampleCount: Number.POSITIVE_INFINITY,
      }
    );
    expect(result.t === 0 || result.t === 1).toBe(true);
    expect(result.distance).toBeGreaterThan(10);
  });

  it('sampleCount=2.5 (non-integer)이면 endpoint 두 점만 비교한다', () => {
    // 정수가 아닌 sampleCount는 step 분모와 i<sampleCount 루프 경계가 모호하다.
    // 정책상 endpoint fallback에 들어간다.
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 2, y: 4 };
    const p2 = { x: 4, y: 0 };
    const result = quadraticClosestLocation(p0, p1, p2, { x: 2, y: 10 }, { sampleCount: 2.5 });
    expect(result.t === 0 || result.t === 1).toBe(true);
    expect(result.distance).toBeGreaterThan(10);
  });

  it('oversized finite 좌표 query는 distanceSquared가 Infinity이고 distance도 Infinity다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 0 };
    const p2 = { x: 2, y: 0 };
    const result = quadraticClosestLocation(p0, p1, p2, { x: 1e200, y: 1e200 });
    expect(result.distanceSquared).toBe(Number.POSITIVE_INFINITY);
    expect(result.distance).toBe(Number.POSITIVE_INFINITY);
    // curve 위 어디든 finite point이므로 result.point는 finite.
    expect(Number.isFinite(result.point.x)).toBe(true);
    expect(Number.isFinite(result.point.y)).toBe(true);
  });

  it('maxIterations=Infinity면 default fallback으로 hang 없이 종료한다', () => {
    // sanitize 없이 Infinity면 for 루프 경계가 무한이라 step<tolerance break를 못 만나면 hang.
    // 정책: invalid이면 default(20)로 fallback. 정상 입력과 동등한 finite 결과.
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 2, y: 4 };
    const p2 = { x: 4, y: 0 };
    const result = quadraticClosestLocation(p0, p1, p2, { x: 2, y: 10 }, { maxIterations: Number.POSITIVE_INFINITY });
    expect(Number.isFinite(result.t)).toBe(true);
    expect(Number.isFinite(result.distance)).toBe(true);
    // 대칭 curve 위쪽 query는 interior minimum이라 endpoint 거리(>10)보다 작아야 한다.
    expect(result.distance).toBeLessThan(10);
  });

  it('maxIterations 정책 invalid (NaN, -1, 0.5)이면 default fallback과 같은 결과를 낸다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 2, y: 4 };
    const p2 = { x: 4, y: 0 };
    const query = { x: 2, y: 10 };
    const ref = quadraticClosestLocation(p0, p1, p2, query);
    for (const bad of [Number.NaN, -1, 0.5]) {
      const result = quadraticClosestLocation(p0, p1, p2, query, { maxIterations: bad });
      expect(Math.abs(result.t - ref.t)).toBeLessThan(1e-10);
      expect(Math.abs(result.distance - ref.distance)).toBeLessThan(1e-10);
    }
  });

  it('tolerance 정책 invalid (NaN, -1, Infinity)이면 default fallback과 같은 결과를 낸다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 2, y: 4 };
    const p2 = { x: 4, y: 0 };
    const query = { x: 2, y: 10 };
    const ref = quadraticClosestLocation(p0, p1, p2, query);
    for (const bad of [Number.NaN, -1, Number.POSITIVE_INFINITY]) {
      const result = quadraticClosestLocation(p0, p1, p2, query, { tolerance: bad });
      expect(Math.abs(result.t - ref.t)).toBeLessThan(1e-10);
      expect(Math.abs(result.distance - ref.distance)).toBeLessThan(1e-10);
    }
  });
});

describe('cubicClosestLocation', () => {
  it('직선 cubic Bezier에서 수직 발과 t가 일치한다', () => {
    // 직선: p0=(0,0), p1=(10/3,0), p2=(20/3,0), p3=(10,0)
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 10 / 3, y: 0 };
    const p2 = { x: 20 / 3, y: 0 };
    const p3 = { x: 10, y: 0 };
    const result = cubicClosestLocation(p0, p1, p2, p3, { x: 5, y: 4 });
    expect(relErr(result.point.x, 5)).toBeLessThan(1e-5);
    expect(Math.abs(result.point.y)).toBeLessThan(1e-5);
    expect(relErr(result.t, 0.5)).toBeLessThan(1e-4);
    expect(relErr(result.distance, 4)).toBeLessThan(1e-5);
  });

  it('query가 시작점 너머이면 t=0이다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 3 };
    const p2 = { x: 3, y: 3 };
    const p3 = { x: 4, y: 0 };
    const result = cubicClosestLocation(p0, p1, p2, p3, { x: -10, y: 0 });
    expect(result.t).toBe(0);
    expect(result.point).toEqual({ x: 0, y: 0 });
    expect(relErr(result.distance, 10)).toBeLessThan(1e-12);
  });

  it('query가 끝점 너머이면 t=1이다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 3 };
    const p2 = { x: 3, y: 3 };
    const p3 = { x: 4, y: 0 };
    const result = cubicClosestLocation(p0, p1, p2, p3, { x: 100, y: 0 });
    expect(result.t).toBe(1);
    expect(result.point).toEqual({ x: 4, y: 0 });
    expect(relErr(result.distance, 96)).toBeLessThan(1e-12);
  });

  it('대칭 cubic 위쪽 query는 t=0.5에서 최근접이다', () => {
    // p0=(0,0), p1=(1,6), p2=(3,6), p3=(4,0): 대칭. t=0.5에서 y 최대.
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 6 };
    const p2 = { x: 3, y: 6 };
    const p3 = { x: 4, y: 0 };
    const expected = cubicEval(p0, p1, p2, p3, 0.5);
    const result = cubicClosestLocation(p0, p1, p2, p3, { x: expected.x, y: 100 });
    expect(relErr(result.t, 0.5)).toBeLessThan(1e-4);
    expect(relErr(result.point.x, expected.x)).toBeLessThan(1e-5);
    expect(relErr(result.point.y, expected.y)).toBeLessThan(1e-5);
  });

  it('tie-break: 동거리에서 작은 t를 선택한다', () => {
    // 진짜 동률을 발동하려면 모든 t에서 거리가 같아야 한다.
    // degenerate point curve(모든 control이 같은 점)에서 query가 그 점이면 모든 t에서 거리=0.
    // 알고리즘은 endpoint t=0을 best로 초기화하고 strict `<` 비교라 모든 sample이 갱신을
    // 일으키지 않는다 → t=0이 결정적으로 선택된다.
    const p = { x: 5, y: 0 };
    const result = cubicClosestLocation(p, p, p, p, { x: 5, y: 0 });
    expect(result.distance).toBeLessThan(1e-9);
    expect(result.t).toBe(0);
  });

  it('degenerate point curve에서 query가 그 점이면 거리=0이고 tie-break으로 t=0이다', () => {
    // 모든 control이 같은 점이고 query도 그 점이면 모든 t에서 이상적으로 거리=0.
    // cubic Bezier evaluation의 ULP 잡음으로 interior t에서 거리²가 미세하게 양수일 수 있어도
    // endpoint t=0의 거리²=0이 strict minimum이라 갱신되지 않는다 → t=0 결정.
    const p = { x: 3, y: 4 };
    const result = cubicClosestLocation(p, p, p, p, { x: 3, y: 4 });
    expect(Math.abs(result.point.x - 3)).toBeLessThan(1e-12);
    expect(Math.abs(result.point.y - 4)).toBeLessThan(1e-12);
    expect(result.t).toBe(0);
    expect(result.distance).toBeLessThan(1e-9);
  });

  it('degenerate point curve에서 떨어진 query의 거리는 |p-query|이다', () => {
    // cubic Bezier evaluation은 t≠{0,1}에서 float rounding으로 1 ULP 차이가 날 수 있다.
    // 떨어진 query에서는 ULP 잡음이 sq를 endpoint 25보다 미세하게 작게 만들 수 있어
    // tie-break보다 strict minimum이 발동될 수 있다. t 결정성 단언은 하지 않는다.
    const p = { x: 3, y: 4 };
    const result = cubicClosestLocation(p, p, p, p, { x: 0, y: 0 });
    expect(Math.abs(result.point.x - 3)).toBeLessThan(1e-12);
    expect(Math.abs(result.point.y - 4)).toBeLessThan(1e-12);
    expect(result.t).toBeGreaterThanOrEqual(0);
    expect(result.t).toBeLessThanOrEqual(1);
    expect(relErr(result.distance, 5)).toBeLessThan(1e-9);
    expect(relErr(result.distanceSquared, 25)).toBeLessThan(1e-9);
  });

  it('tuple XYInput을 받는다', () => {
    const r1 = cubicClosestLocation({ x: 0, y: 0 }, { x: 1, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 0 }, { x: 2, y: 2 });
    const r2 = cubicClosestLocation([0, 0], [1, 3], [3, 3], [4, 0], [2, 2]);
    expect(Math.abs(r1.point.x - r2.point.x)).toBeLessThan(1e-10);
    expect(Math.abs(r1.point.y - r2.point.y)).toBeLessThan(1e-10);
    expect(Math.abs(r1.t - r2.t)).toBeLessThan(1e-10);
    expect(Math.abs(r1.distance - r2.distance)).toBeLessThan(1e-10);
  });

  it('distance ** 2 ≈ distanceSquared', () => {
    const result = cubicClosestLocation({ x: 0, y: 0 }, { x: 1, y: 4 }, { x: 3, y: 4 }, { x: 5, y: 0 }, { x: 2, y: 3 });
    const sqOfDist = result.distance * result.distance;
    expect(Math.abs(sqOfDist - result.distanceSquared)).toBeLessThan(Math.max(1, result.distanceSquared) * 1e-12);
  });

  it('result.point가 curve(t)와 일치한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 4 };
    const p2 = { x: 3, y: 4 };
    const p3 = { x: 5, y: 0 };
    const result = cubicClosestLocation(p0, p1, p2, p3, { x: 2, y: 3 });
    const evald = cubicEval(p0, p1, p2, p3, result.t);
    expect(Math.abs(result.point.x - evald.x)).toBeLessThan(1e-9);
    expect(Math.abs(result.point.y - evald.y)).toBeLessThan(1e-9);
  });

  it('sampleCount=1이면 endpoint 두 점만 비교한다', () => {
    // 대칭 cubic 위쪽 query → interior는 (2,?)지만 sample 없으면 endpoint만 본다.
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 6 };
    const p2 = { x: 3, y: 6 };
    const p3 = { x: 4, y: 0 };
    const result = cubicClosestLocation(p0, p1, p2, p3, { x: 2, y: 100 }, { sampleCount: 1 });
    expect(result.t === 0 || result.t === 1).toBe(true);
    // endpoint 거리는 √(4 + 10000)≈100, interior는 훨씬 작다.
    expect(result.distance).toBeGreaterThan(99);
  });

  it('sampleCount=0이면 endpoint 두 점만 비교한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 6 };
    const p2 = { x: 3, y: 6 };
    const p3 = { x: 4, y: 0 };
    const result = cubicClosestLocation(p0, p1, p2, p3, { x: 2, y: 100 }, { sampleCount: 0 });
    expect(result.t === 0 || result.t === 1).toBe(true);
    expect(result.distance).toBeGreaterThan(99);
  });

  it('sampleCount=NaN이면 endpoint 두 점만 비교한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 6 };
    const p2 = { x: 3, y: 6 };
    const p3 = { x: 4, y: 0 };
    const result = cubicClosestLocation(p0, p1, p2, p3, { x: 2, y: 100 }, { sampleCount: Number.NaN });
    expect(result.t === 0 || result.t === 1).toBe(true);
    expect(result.distance).toBeGreaterThan(99);
  });

  it('sampleCount=Infinity이면 endpoint 두 점만 비교한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 6 };
    const p2 = { x: 3, y: 6 };
    const p3 = { x: 4, y: 0 };
    const result = cubicClosestLocation(
      p0,
      p1,
      p2,
      p3,
      { x: 2, y: 100 },
      {
        sampleCount: Number.POSITIVE_INFINITY,
      }
    );
    expect(result.t === 0 || result.t === 1).toBe(true);
    expect(result.distance).toBeGreaterThan(99);
  });

  it('sampleCount=2.5 (non-integer)이면 endpoint 두 점만 비교한다', () => {
    // 정수가 아닌 sampleCount는 step 분모와 i<sampleCount 루프 경계가 모호하다.
    // 정책상 endpoint fallback에 들어간다.
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 6 };
    const p2 = { x: 3, y: 6 };
    const p3 = { x: 4, y: 0 };
    const result = cubicClosestLocation(p0, p1, p2, p3, { x: 2, y: 100 }, { sampleCount: 2.5 });
    expect(result.t === 0 || result.t === 1).toBe(true);
    expect(result.distance).toBeGreaterThan(99);
  });

  it('oversized finite 좌표 query는 distanceSquared가 Infinity이고 distance도 Infinity다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 0 };
    const p2 = { x: 2, y: 0 };
    const p3 = { x: 3, y: 0 };
    const result = cubicClosestLocation(p0, p1, p2, p3, { x: 1e200, y: 1e200 });
    expect(result.distanceSquared).toBe(Number.POSITIVE_INFINITY);
    expect(result.distance).toBe(Number.POSITIVE_INFINITY);
    expect(Number.isFinite(result.point.x)).toBe(true);
    expect(Number.isFinite(result.point.y)).toBe(true);
  });

  it('maxIterations=Infinity면 default fallback으로 hang 없이 종료한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 6 };
    const p2 = { x: 3, y: 6 };
    const p3 = { x: 4, y: 0 };
    const expected = cubicEval(p0, p1, p2, p3, 0.5);
    const result = cubicClosestLocation(
      p0,
      p1,
      p2,
      p3,
      { x: expected.x, y: 100 },
      { maxIterations: Number.POSITIVE_INFINITY }
    );
    expect(Number.isFinite(result.t)).toBe(true);
    expect(Number.isFinite(result.distance)).toBe(true);
    // 대칭 cubic 위쪽 query는 interior minimum이라 endpoint 거리(>99)보다 작아야 한다.
    expect(result.distance).toBeLessThan(99);
  });

  it('maxIterations 정책 invalid (NaN, -1, 0.5)이면 default fallback과 같은 결과를 낸다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 6 };
    const p2 = { x: 3, y: 6 };
    const p3 = { x: 4, y: 0 };
    const query = { x: 2, y: 100 };
    const ref = cubicClosestLocation(p0, p1, p2, p3, query);
    for (const bad of [Number.NaN, -1, 0.5]) {
      const result = cubicClosestLocation(p0, p1, p2, p3, query, { maxIterations: bad });
      expect(Math.abs(result.t - ref.t)).toBeLessThan(1e-10);
      expect(Math.abs(result.distance - ref.distance)).toBeLessThan(1e-10);
    }
  });

  it('tolerance 정책 invalid (NaN, -1, Infinity)이면 default fallback과 같은 결과를 낸다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 6 };
    const p2 = { x: 3, y: 6 };
    const p3 = { x: 4, y: 0 };
    const query = { x: 2, y: 100 };
    const ref = cubicClosestLocation(p0, p1, p2, p3, query);
    for (const bad of [Number.NaN, -1, Number.POSITIVE_INFINITY]) {
      const result = cubicClosestLocation(p0, p1, p2, p3, query, { tolerance: bad });
      expect(Math.abs(result.t - ref.t)).toBeLessThan(1e-10);
      expect(Math.abs(result.distance - ref.distance)).toBeLessThan(1e-10);
    }
  });
});

describe('회귀: 기존 closest-point Into와 새 closest-location이 같은 좌표를 반환한다', () => {
  it('quadraticClosestPointInto와 quadraticClosestLocation의 point가 일치한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 3 };
    const p2 = { x: 5, y: 1 };
    const query = { x: 2, y: 2 };
    const out = { x: 0, y: 0 };
    quadraticClosestPointInto(out, p0, p1, p2, query);
    const loc = quadraticClosestLocation(p0, p1, p2, query);
    expect(Math.abs(out.x - loc.point.x)).toBeLessThan(1e-12);
    expect(Math.abs(out.y - loc.point.y)).toBeLessThan(1e-12);
  });

  it('cubicClosestPointInto와 cubicClosestLocation의 point가 일치한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 4 };
    const p2 = { x: 3, y: 4 };
    const p3 = { x: 5, y: 0 };
    const query = { x: 2, y: 3 };
    const out = { x: 0, y: 0 };
    cubicClosestPointInto(out, p0, p1, p2, p3, query);
    const loc = cubicClosestLocation(p0, p1, p2, p3, query);
    expect(Math.abs(out.x - loc.point.x)).toBeLessThan(1e-12);
    expect(Math.abs(out.y - loc.point.y)).toBeLessThan(1e-12);
  });

  it('option을 공유해도 quadratic Into와 Location의 point가 일치한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 2, y: 5 };
    const p2 = { x: 6, y: -1 };
    const query = { x: 4, y: 2 };
    const opts = { tolerance: 1e-10, maxIterations: 50, sampleCount: 21 };
    const out = { x: 0, y: 0 };
    quadraticClosestPointInto(out, p0, p1, p2, query, opts);
    const loc = quadraticClosestLocation(p0, p1, p2, query, opts);
    expect(Math.abs(out.x - loc.point.x)).toBeLessThan(1e-12);
    expect(Math.abs(out.y - loc.point.y)).toBeLessThan(1e-12);
  });

  it('option을 공유해도 cubic Into와 Location의 point가 일치한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 2, y: 7 };
    const p2 = { x: 5, y: 7 };
    const p3 = { x: 8, y: 0 };
    const query = { x: 3, y: 4 };
    const opts = { tolerance: 1e-10, maxIterations: 50, sampleCount: 21 };
    const out = { x: 0, y: 0 };
    cubicClosestPointInto(out, p0, p1, p2, p3, query, opts);
    const loc = cubicClosestLocation(p0, p1, p2, p3, query, opts);
    expect(Math.abs(out.x - loc.point.x)).toBeLessThan(1e-12);
    expect(Math.abs(out.y - loc.point.y)).toBeLessThan(1e-12);
  });
});
