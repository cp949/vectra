/**
 * Bezier segment × closed primitive boolean relation 공용 internal helper.
 *
 * curve × circle/ellipse는 ellipse local 정규화로 implicit residual `f(t) = U(t)² + V(t)² - 1`을
 * 만들고 `[0, 1]` 최솟값이 0 이하인지로 closed disk 교차를 판정한다. curve × rect/bounds/triangle은
 * primitive edge를 segment로 분해해 curve numeric kernel(probe)로 교차를 보고, primitive가 curve를
 * 둘러싸는 containment-only case는 endpoint containment fallback으로 잡는다.
 *
 * public leaf끼리 직접 import하지 않으려고 degree-agnostic 계산을 이 internal helper에 모은다.
 * quadratic/cubic public leaf는 power-basis 계수와 numeric kernel probe만 전달한다.
 *
 * 이 모듈은 internal 전용으로, public API에 노출되지 않는다.
 */

import { cubicLineIntersectionsInto } from '../curve/cubic-line-intersections-into';
import { quadraticLineIntersectionsInto } from '../curve/quadratic-line-intersections-into';
import { rectContainsPointXY } from '../internal/polygon';
import {
  evaluatePolynomial,
  minOnClosedUnit,
  multiplyPolynomials,
  realRootsInClosedUnit,
} from '../internal/polynomial';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, IntersectionHit, XYInput } from '../types';

/** curve가 infinite-line과 만나는 hit를 outHits에 채우는 probe (호출 전 비운다). */
export type CurveLineProbe = {
  (outHits: IntersectionHit[], line: InfiniteLineLike): void;
  overlapsSegment(ax: number, ay: number, bx: number, by: number): boolean;
};

/**
 * quadratic Bezier × infinite-line numeric kernel을 감싼 probe를 만든다.
 *
 * public leaf끼리 직접 import하지 않으려고 curve numeric leaf 호출을 이 internal helper에 둔다.
 *
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param epsilon geometric 거리 tolerance
 */
export function makeQuadraticProbe(p0: XYInput, p1: XYInput, p2: XYInput, epsilon: number): CurveLineProbe {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);
  const xCoef = [p0x, 2 * (p1x - p0x), p0x - 2 * p1x + p2x];
  const yCoef = [p0y, 2 * (p1y - p0y), p0y - 2 * p1y + p2y];

  const probe = ((hits, line) => {
    quadraticLineIntersectionsInto(hits, p0, p1, p2, line, { epsilon });
  }) as CurveLineProbe;
  probe.overlapsSegment = (ax, ay, bx, by) => curveOverlapsSegment(xCoef, yCoef, ax, ay, bx, by, epsilon);
  return probe;
}

/**
 * cubic Bezier × infinite-line numeric kernel을 감싼 probe를 만든다.
 *
 * public leaf끼리 직접 import하지 않으려고 curve numeric leaf 호출을 이 internal helper에 둔다.
 *
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param epsilon geometric 거리 tolerance
 */
export function makeCubicProbe(p0: XYInput, p1: XYInput, p2: XYInput, p3: XYInput, epsilon: number): CurveLineProbe {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);
  const p3x = readX(p3);
  const p3y = readY(p3);
  const xCoef = [p0x, 3 * (p1x - p0x), 3 * (p0x - 2 * p1x + p2x), -p0x + 3 * p1x - 3 * p2x + p3x];
  const yCoef = [p0y, 3 * (p1y - p0y), 3 * (p0y - 2 * p1y + p2y), -p0y + 3 * p1y - 3 * p2y + p3y];

  const probe = ((hits, line) => {
    cubicLineIntersectionsInto(hits, p0, p1, p2, p3, line, { epsilon });
  }) as CurveLineProbe;
  probe.overlapsSegment = (ax, ay, bx, by) => curveOverlapsSegment(xCoef, yCoef, ax, ay, bx, by, epsilon);
  return probe;
}

/** 모든 값이 finite(NaN/±Infinity 아님)이면 true를 반환한다. */
export function allFinite(values: readonly number[]): boolean {
  for (const value of values) {
    if (!Number.isFinite(value)) return false;
  }
  return true;
}

/**
 * power-basis 곡선 점 `(x(t), y(t))`이 closed ellipse disk와 만나면 true를 반환한다.
 *
 * - empty ellipse (rx ≤ 0 또는 ry ≤ 0): false.
 * - boundary 접촉(tangent), boundary 가로지르기, endpoint 내부 포함, ellipse가 curve를 완전히
 *   포함하는 경우 모두 true.
 * - circle은 rx = ry = radius로 환원해 호출한다.
 *
 * @param xCoef x(t)의 power-basis 계수 (낮은 차수 → 높은 차수)
 * @param yCoef y(t)의 power-basis 계수 (낮은 차수 → 높은 차수)
 * @param cx ellipse center x
 * @param cy ellipse center y
 * @param rx ellipse x반지름
 * @param ry ellipse y반지름
 * @param epsilon boundary 접촉 판정 tolerance. ellipse-local 정규화 residual `f`에 대한
 *   무차원 임계값이며 geometric 거리가 아니다. geometric 접촉폭은 ellipse 반지름에 비례한다
 *   (반지름이 클수록 같은 normalized 임계값이 더 넓은 거리를 허용한다). `lineFamilyEllipseIntersects`의
 *   discriminant 임계값과 같은 normalized tolerance 컨벤션을 따른다.
 */
export function curveEllipseDiskIntersects(
  xCoef: readonly number[],
  yCoef: readonly number[],
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  epsilon: number
): boolean {
  if (rx <= 0 || ry <= 0) return false;

  // U(t) = (x(t) - cx) / rx, V(t) = (y(t) - cy) / ry
  const u = xCoef.map((c, i) => (i === 0 ? c - cx : c) / rx);
  const v = yCoef.map((c, i) => (i === 0 ? c - cy : c) / ry);

  // f(t) = U(t)² + V(t)² - 1
  const uu = multiplyPolynomials(u, u);
  const vv = multiplyPolynomials(v, v);
  const f = uu.map((c, i) => c + (vv[i] ?? 0));
  f[0] -= 1;

  // f(t) ≤ 0 인 t가 [0, 1]에 있으면 점이 closed disk 안 또는 boundary 위에 있다.
  return minOnClosedUnit(f) <= epsilon;
}

/** curve가 segment A→B와 segment range 안에서 만나면 true를 반환한다. */
function curveCrossesSegment(
  probe: CurveLineProbe,
  hits: IntersectionHit[],
  ax: number,
  ay: number,
  bx: number,
  by: number
): boolean {
  if (probe.overlapsSegment(ax, ay, bx, by)) return true;

  const line: InfiniteLineLike = {
    origin: { x: ax, y: ay },
    direction: { x: bx - ax, y: by - ay },
  };
  probe(hits, line);
  for (const hit of hits) {
    // direction을 정규화하지 않으므로 tA가 segment parameter [0, 1]로 유지된다.
    if (hit.tA >= 0 && hit.tA <= 1) return true;
  }
  return false;
}

function curveOverlapsSegment(
  xCoef: readonly number[],
  yCoef: readonly number[],
  ax: number,
  ay: number,
  bx: number,
  by: number,
  epsilon: number
): boolean {
  const dx = bx - ax;
  const dy = by - ay;
  const length = Math.hypot(dx, dy);
  if (length <= epsilon) return curveContainsPoint(xCoef, yCoef, ax, ay, epsilon);
  const dd = dx * dx + dy * dy;

  for (let i = 0; i < xCoef.length; i++) {
    const xC = xCoef[i] ?? 0;
    const yC = yCoef[i] ?? 0;
    const crossCoef = i === 0 ? (xC - ax) * dy - (yC - ay) * dx : xC * dy - yC * dx;
    if (Math.abs(crossCoef) > epsilon * length) return false;
  }

  const sCoef = xCoef.map((xC, i) => {
    const yC = yCoef[i] ?? 0;
    if (i === 0) return ((xC - ax) * dx + (yC - ay) * dy) / dd;
    return (xC * dx + yC * dy) / dd;
  });
  const minS = minOnClosedUnit(sCoef);
  const maxS = -minOnClosedUnit(sCoef.map((c) => -c));
  return minS <= 1 + epsilon && maxS >= -epsilon;
}

function curveContainsPoint(
  xCoef: readonly number[],
  yCoef: readonly number[],
  px: number,
  py: number,
  epsilon: number
): boolean {
  const hits: number[] = [];
  collectUnitRoots(
    hits,
    yCoef.map((c, i) => (i === 0 ? c - py : c)),
    epsilon
  );
  collectUnitRoots(
    hits,
    xCoef.map((c, i) => (i === 0 ? c - px : c)),
    epsilon
  );

  for (const t of hits) {
    const dx = evaluatePolynomial(xCoef, t) - px;
    const dy = evaluatePolynomial(yCoef, t) - py;
    if (dx * dx + dy * dy <= epsilon * epsilon) return true;
  }
  return false;
}

function collectUnitRoots(out: number[], coeffs: readonly number[], epsilon: number): void {
  for (const t of [0, ...realRootsInClosedUnit(coeffs), 1]) {
    if (t >= -epsilon && t <= 1 + epsilon && !out.some((existing) => Math.abs(existing - t) <= epsilon)) {
      out.push(Math.max(0, Math.min(1, t)));
    }
  }
}

/**
 * Bezier curve와 rect가 교차하면 true를 반환한다.
 *
 * - empty rect (width ≤ 0 또는 height ≤ 0): false.
 * - endpoint가 rect 내부(경계 포함)이거나 curve가 rect 경계를 가로지르면 true.
 * - rect가 curve를 완전히 둘러싸는 case는 endpoint containment로 잡는다.
 *
 * @param probe curve × infinite-line numeric kernel probe
 * @param p0x curve 시작점 x
 * @param p0y curve 시작점 y
 * @param pLastx curve 끝점 x
 * @param pLasty curve 끝점 y
 * @param rx rect x
 * @param ry rect y
 * @param rw rect width
 * @param rh rect height
 */
export function curveRectIntersects(
  probe: CurveLineProbe,
  p0x: number,
  p0y: number,
  pLastx: number,
  pLasty: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  if (rw <= 0 || rh <= 0) return false;
  if (rectContainsPointXY(rx, ry, rw, rh, p0x, p0y)) return true;
  if (rectContainsPointXY(rx, ry, rw, rh, pLastx, pLasty)) return true;

  const x1 = rx + rw;
  const y1 = ry + rh;
  const hits: IntersectionHit[] = [];
  return (
    curveCrossesSegment(probe, hits, rx, ry, x1, ry) ||
    curveCrossesSegment(probe, hits, x1, ry, x1, y1) ||
    curveCrossesSegment(probe, hits, x1, y1, rx, y1) ||
    curveCrossesSegment(probe, hits, rx, y1, rx, ry)
  );
}

/**
 * Bezier curve와 axis-aligned bounds가 교차하면 true를 반환한다.
 *
 * - inverted bounds (min > max): false. zero-extent bounds는 유효 입력이다.
 * - endpoint가 bounds 내부(경계 포함)이거나 curve가 bounds 경계를 가로지르면 true.
 *
 * @param probe curve × infinite-line numeric kernel probe
 * @param p0x curve 시작점 x
 * @param p0y curve 시작점 y
 * @param pLastx curve 끝점 x
 * @param pLasty curve 끝점 y
 * @param x0 bounds min x
 * @param y0 bounds min y
 * @param x1 bounds max x
 * @param y1 bounds max y
 */
export function curveBoundsIntersects(
  probe: CurveLineProbe,
  p0x: number,
  p0y: number,
  pLastx: number,
  pLasty: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): boolean {
  if (x1 < x0 || y1 < y0) return false;
  if (p0x >= x0 && p0x <= x1 && p0y >= y0 && p0y <= y1) return true;
  if (pLastx >= x0 && pLastx <= x1 && pLasty >= y0 && pLasty <= y1) return true;

  const hits: IntersectionHit[] = [];
  return (
    curveCrossesSegment(probe, hits, x0, y0, x1, y0) ||
    curveCrossesSegment(probe, hits, x1, y0, x1, y1) ||
    curveCrossesSegment(probe, hits, x1, y1, x0, y1) ||
    curveCrossesSegment(probe, hits, x0, y1, x0, y0)
  );
}

/**
 * Bezier curve와 triangle이 교차하면 true를 반환한다.
 *
 * - degenerate triangle (signed area 2× === 0): false.
 * - endpoint가 triangle 내부(경계 포함)이거나 curve가 triangle 변을 가로지르면 true.
 * - triangle이 curve를 완전히 둘러싸는 case는 endpoint containment로 잡는다.
 *
 * @param probe curve × infinite-line numeric kernel probe
 * @param p0x curve 시작점 x
 * @param p0y curve 시작점 y
 * @param pLastx curve 끝점 x
 * @param pLasty curve 끝점 y
 * @param ax triangle vertex a x
 * @param ay triangle vertex a y
 * @param bx triangle vertex b x
 * @param by triangle vertex b y
 * @param cx triangle vertex c x
 * @param cy triangle vertex c y
 */
export function curveTriangleIntersects(
  probe: CurveLineProbe,
  p0x: number,
  p0y: number,
  pLastx: number,
  pLasty: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number
): boolean {
  const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  if (area2 === 0) return false;

  // 점이 triangle 내부(경계 포함)인지 barycentric cross-product 부호로 판정한다.
  const contains = (px: number, py: number): boolean => {
    const d1 = (px - ax) * (by - ay) - (py - ay) * (bx - ax);
    const d2 = (px - bx) * (cy - by) - (py - by) * (cx - bx);
    const d3 = (px - cx) * (ay - cy) - (py - cy) * (ax - cx);
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
  };

  if (contains(p0x, p0y)) return true;
  if (contains(pLastx, pLasty)) return true;

  const hits: IntersectionHit[] = [];
  return (
    curveCrossesSegment(probe, hits, ax, ay, bx, by) ||
    curveCrossesSegment(probe, hits, bx, by, cx, cy) ||
    curveCrossesSegment(probe, hits, cx, cy, ax, ay)
  );
}
