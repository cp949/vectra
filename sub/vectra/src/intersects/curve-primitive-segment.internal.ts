/**
 * Bezier segment × line/segment 교차·containment numeric kernel (internal 전용).
 *
 * curve × rect/bounds/triangle은 primitive edge를 segment로 분해해 이 kernel(probe overlap +
 * power-basis root containment)로 교차를 보고한다. collinear overlap은 cross-coefficient로
 * 직선 일치를 판정하고 projection s로 range 겹침을 확인한다. zero-length segment는 단일 점
 * containment로 위임한다.
 *
 * 이 모듈은 internal 전용으로, public API에 노출되지 않는다.
 */

import { evaluatePolynomial, minOnClosedUnit, realRootsInClosedUnit } from '../internal/polynomial';
import type { InfiniteLineLike, IntersectionHit } from '../types';
import type { CurveLineProbe } from './curve-primitive-probe.internal';

/** curve가 segment A→B와 segment range 안에서 만나면 true를 반환한다. */
export function curveCrossesSegment(
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

export function curveOverlapsSegment(
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

export function curveContainsPoint(
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

export function collectUnitRoots(out: number[], coeffs: readonly number[], epsilon: number): void {
  for (const t of [0, ...realRootsInClosedUnit(coeffs), 1]) {
    if (t >= -epsilon && t <= 1 + epsilon && !out.some((existing) => Math.abs(existing - t) <= epsilon)) {
      out.push(Math.max(0, Math.min(1, t)));
    }
  }
}
