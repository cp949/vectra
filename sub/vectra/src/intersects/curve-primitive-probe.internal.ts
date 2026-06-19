/**
 * Bezier segment × infinite-line numeric kernel probe factory + curve × ellipse disk relation.
 *
 * curve × circle/ellipse는 ellipse local 정규화로 implicit residual `f(t) = U(t)² + V(t)² - 1`을
 * 만들고 `[0, 1]` 최솟값이 0 이하인지로 closed disk 교차를 판정한다.
 *
 * public leaf끼리 직접 import하지 않으려고 degree-agnostic 계산을 internal helper에 모은다.
 * quadratic/cubic public leaf는 power-basis 계수와 numeric kernel probe만 전달한다.
 *
 * 이 모듈은 internal 전용으로, public API에 노출되지 않는다.
 */

import { cubicLineIntersectionsInto } from '../curve/cubic-line-intersections-into';
import { quadraticLineIntersectionsInto } from '../curve/quadratic-line-intersections-into';
import { minOnClosedUnit, multiplyPolynomials } from '../internal/polynomial';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, IntersectionHit, XYInput } from '../types';
import { curveOverlapsSegment } from './curve-primitive-segment.internal';

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
