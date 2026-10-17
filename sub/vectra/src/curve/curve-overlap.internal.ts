import type { IntersectionHit, XYObjectWritable } from '../types';
import {
  type BezierClosestLocationCore,
  findCubicClosestLocation,
  findQuadraticClosestLocation,
} from './bezier-closest-location.internal';
import {
  type CubicFlat,
  cubicHullBounds,
  type QuadFlat,
  quadraticHullBounds,
  writeHit,
} from './curve-intersections.internal';

/** overlap 판정에 쓰는 curve 평가 adapter. */
export interface OverlapCurve {
  /** t에서의 curve 좌표. */
  pointAt: (t: number) => [number, number];

  /** (x, y)에 가장 가까운 curve 위치. */
  closest: (x: number, y: number) => BezierClosestLocationCore;

  /** control point hull AABB. endpoint projection 전 빠른 배제에 쓴다. */
  hull: [number, number, number, number];
}

/**
 * 두 curve가 같은 기하 위에서 겹치는 parameter 구간.
 * `tA0 < tA1`이다. `tB0`/`tB1`은 각각 `tA0`/`tA1`에 대응하며 대소 관계는 방향에 따라 다르다.
 */
export interface CurveOverlap {
  tA0: number;
  tA1: number;
  tB0: number;
  tB1: number;
}

/**
 * 겹침 검증 sample 수.
 * 서로 다른 cubic 두 개는 최대 9점에서 만난다(Bezout). endpoint 2개와 내부 sample을 합쳐 9를 넘긴다.
 */
const OVERLAP_SAMPLE_COUNT = 16;

/**
 * 겹침 구간 안에서 대응 parameter가 단조인지 볼 때 허용하는 역행 폭.
 * closest-location Newton 잔차만 흡수한다. 거리 epsilon과 무관한 parameter 축 상수다.
 */
const OVERLAP_PARAM_SLACK = 1e-9;

/** endpoint projection용 closest-location 옵션. 겹침 검증은 기본 `1e-8`보다 촘촘한 수렴이 필요하다. */
const OVERLAP_CLOSEST_OPTIONS = { tolerance: 1e-14 };

interface OverlapCandidate {
  tA: number;
  tB: number;
}

/** quadratic flat 좌표를 overlap 판정 adapter로 감싼다. */
export function quadraticOverlapCurve(flat: QuadFlat): OverlapCurve {
  const [p0x, p0y, p1x, p1y, p2x, p2y] = flat;
  return {
    pointAt: (t) => {
      const mt = 1 - t;
      return [mt * mt * p0x + 2 * mt * t * p1x + t * t * p2x, mt * mt * p0y + 2 * mt * t * p1y + t * t * p2y];
    },
    closest: (x, y) => findQuadraticClosestLocation(p0x, p0y, p1x, p1y, p2x, p2y, x, y, OVERLAP_CLOSEST_OPTIONS),
    hull: quadraticHullBounds(...flat),
  };
}

/** cubic flat 좌표를 overlap 판정 adapter로 감싼다. */
export function cubicOverlapCurve(flat: CubicFlat): OverlapCurve {
  const [p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y] = flat;
  return {
    pointAt: (t) => {
      const mt = 1 - t;
      const mt2 = mt * mt;
      const t2 = t * t;
      return [
        mt2 * mt * p0x + 3 * mt2 * t * p1x + 3 * mt * t2 * p2x + t2 * t * p3x,
        mt2 * mt * p0y + 3 * mt2 * t * p1y + 3 * mt * t2 * p2y + t2 * t * p3y,
      ];
    },
    closest: (x, y) => findCubicClosestLocation(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, x, y, OVERLAP_CLOSEST_OPTIONS),
    hull: cubicHullBounds(...flat),
  };
}

function insideHull(hull: [number, number, number, number], x: number, y: number, epsilon: number): boolean {
  return x >= hull[0] - epsilon && x <= hull[2] + epsilon && y >= hull[1] - epsilon && y <= hull[3] + epsilon;
}

function distanceSquared(a: [number, number], b: [number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

/**
 * 두 parameter 사이 curve 조각이 한 점으로 붕괴했는지 본다.
 * 양 끝과 중간점이 모두 epsilon 안이면 같은 위치로 취급한다.
 * closed cubic처럼 양 끝이 같은 좌표여도 중간점이 멀면 다른 위치다.
 */
function sameLocation(curve: OverlapCurve, t0: number, t1: number, epsilonSq: number): boolean {
  const p0 = curve.pointAt(t0);
  return (
    distanceSquared(p0, curve.pointAt(t1)) <= epsilonSq &&
    distanceSquared(p0, curve.pointAt((t0 + t1) * 0.5)) <= epsilonSq
  );
}

/**
 * 후보를 추가한다. 같은 위치 후보가 이미 있으면 endpoint에서 온 정확한 parameter로 덮어쓴다.
 * projection으로 얻은 parameter는 Newton 잔차가 남으므로 endpoint 값 `0`/`1`을 우선한다.
 */
function addCandidate(
  candidates: OverlapCandidate[],
  a: OverlapCurve,
  b: OverlapCurve,
  tA: number,
  tB: number,
  exactSide: 'A' | 'B',
  epsilonSq: number
): void {
  for (const existing of candidates) {
    if (sameLocation(a, existing.tA, tA, epsilonSq) && sameLocation(b, existing.tB, tB, epsilonSq)) {
      if (exactSide === 'A') existing.tA = tA;
      else existing.tB = tB;
      return;
    }
  }
  candidates.push({ tA, tB });
}

/**
 * projection parameter와 같은 위치를 가리키는 parameter 목록을 반환한다.
 * closed curve(`P(0) = P(1)`)의 endpoint는 `0`과 `1` 두 parameter를 가진다.
 * closest-location은 동점에서 작은 t만 고르므로 반대쪽 endpoint parameter를 보충한다.
 */
function closedEndpointAliases(curve: OverlapCurve, t: number, epsilonSq: number): number[] {
  const start = curve.pointAt(0);
  if (distanceSquared(start, curve.pointAt(1)) > epsilonSq) return [t];
  if (distanceSquared(start, curve.pointAt(t)) > epsilonSq) return [t];
  return [t, 0, 1];
}

/**
 * from curve의 [t0, t1] 내부 sample이 모두 to curve 위에 있고, 대응 parameter가
 * u0에서 u1 방향으로 단조 진행하는지 확인한다.
 */
function liesOnAlong(
  from: OverlapCurve,
  to: OverlapCurve,
  t0: number,
  t1: number,
  u0: number,
  u1: number,
  epsilonSq: number
): boolean {
  const direction = u1 > u0 ? 1 : -1;
  let previous = u0;
  for (let i = 1; i <= OVERLAP_SAMPLE_COUNT; i++) {
    const t = t0 + ((t1 - t0) * i) / (OVERLAP_SAMPLE_COUNT + 1);
    const [x, y] = from.pointAt(t);
    const location = to.closest(x, y);
    if (location.distanceSquared > epsilonSq) return false;
    if ((location.t - previous) * direction < -OVERLAP_PARAM_SLACK) return false;
    previous = location.t;
  }
  return (u1 - previous) * direction >= -OVERLAP_PARAM_SLACK;
}

/**
 * 두 curve가 같은 기하 위에서 길이 있는 구간을 공유하면 그 parameter 구간을 반환한다.
 *
 * 겹침 구간의 양 끝은 반드시 네 endpoint `A(0)`, `A(1)`, `B(0)`, `B(1)` 중 하나다.
 * 각 endpoint를 반대 curve에 투영해 후보 (tA, tB)를 모으고, 후보 쌍 사이를 양방향 sampling으로 검증한다.
 * 검증을 통과한 쌍 중 tA 구간이 가장 긴 쌍을 고른다. 겹침이 없으면 null이다.
 */
export function findCurveOverlap(a: OverlapCurve, b: OverlapCurve, epsilon: number): CurveOverlap | null {
  const epsilonSq = epsilon * epsilon;
  const candidates: OverlapCandidate[] = [];

  for (const tA of [0, 1]) {
    const point = a.pointAt(tA);
    if (!insideHull(b.hull, point[0], point[1], epsilon)) continue;
    const location = b.closest(point[0], point[1]);
    if (location.distanceSquared > epsilonSq) continue;
    for (const tB of closedEndpointAliases(b, location.t, epsilonSq)) {
      addCandidate(candidates, a, b, tA, tB, 'A', epsilonSq);
    }
  }
  for (const tB of [0, 1]) {
    const point = b.pointAt(tB);
    if (!insideHull(a.hull, point[0], point[1], epsilon)) continue;
    const location = a.closest(point[0], point[1]);
    if (location.distanceSquared > epsilonSq) continue;
    for (const tA of closedEndpointAliases(a, location.t, epsilonSq)) {
      addCandidate(candidates, a, b, tA, tB, 'B', epsilonSq);
    }
  }

  let best: CurveOverlap | null = null;
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const [first, second] =
        candidates[i].tA <= candidates[j].tA ? [candidates[i], candidates[j]] : [candidates[j], candidates[i]];
      if (first.tA === second.tA || first.tB === second.tB) continue;
      if (best !== null && second.tA - first.tA <= best.tA1 - best.tA0) continue;
      if (!liesOnAlong(a, b, first.tA, second.tA, first.tB, second.tB, epsilonSq)) continue;
      const [bLow, bHigh] = first.tB < second.tB ? [first, second] : [second, first];
      if (!liesOnAlong(b, a, bLow.tB, bHigh.tB, bLow.tA, bHigh.tA, epsilonSq)) continue;
      best = { tA0: first.tA, tA1: second.tA, tB0: first.tB, tB1: second.tB };
    }
  }
  return best;
}

/** 겹침 구간 양 끝점을 `kind: 'overlap'` hit로 기록한다. 좌표는 curve A 위에서 계산한다. */
export function pushOverlapHits(
  outHits: IntersectionHit[],
  overlap: CurveOverlap,
  a: OverlapCurve,
  makePoint: () => XYObjectWritable
): void {
  const [x0, y0] = a.pointAt(overlap.tA0);
  writeHit(outHits, x0, y0, 'overlap', overlap.tA0, overlap.tB0, makePoint);
  const [x1, y1] = a.pointAt(overlap.tA1);
  writeHit(outHits, x1, y1, 'overlap', overlap.tA1, overlap.tB1, makePoint);
}

/**
 * subdivision box가 겹침 구간 안에 완전히 들어가는지 판정하는 predicate를 만든다.
 * 겹침 내부 box는 모든 하위 box가 교차로 보이므로 재귀하지 않는다.
 */
export function overlapBoxFilter(
  overlap: CurveOverlap
): (tA0: number, tA1: number, tB0: number, tB1: number) => boolean {
  const bLow = Math.min(overlap.tB0, overlap.tB1);
  const bHigh = Math.max(overlap.tB0, overlap.tB1);
  return (tA0, tA1, tB0, tB1) => tA0 >= overlap.tA0 && tA1 <= overlap.tA1 && tB0 >= bLow && tB1 <= bHigh;
}
