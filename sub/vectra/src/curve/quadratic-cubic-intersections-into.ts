import { readX, readY } from '../internal/xy';
import type { CurveIntersectionOptions, IntersectionHit, XYInput, XYObjectWritable, XYWritable } from '../types';
import {
  type CubicFlat,
  classifyIntersectionKind,
  cubicHullBounds,
  cubicTangent,
  DEFAULT_MAX_DEPTH,
  evalCubicInto,
  evalQuadraticInto,
  pushHitIfNewAB,
  type QuadFlat,
  quadraticHullBounds,
  quadraticTangent,
  resolveIntersectionParams,
  resolveOptions,
  SUBDIVISION_DEDUPE_T_FACTOR,
  SUBDIVISION_KIND_EPSILON_FACTOR,
  splitCubic,
  splitQuadratic,
  subCurveEvaluator,
  subdivideCurves,
} from './curve-intersections.internal';
import {
  cubicOverlapCurve,
  findCurveOverlap,
  overlapBoxFilter,
  pushOverlapHits,
  quadraticOverlapCurve,
} from './curve-overlap.internal';

/**
 * quadratic × cubic subdivision 수렴 시 교차점을 계산해 outHits에 push한다.
 * midpoint parameter를 Newton으로 다듬은 뒤 curve A(quadratic) 위에서 원본 좌표로 정밀 계산한다.
 * 교차 종류는 다듬은 parameter에서 curve A는 원본, curve B(cubic)는 bSub의 tangent로 판정한다.
 */
function onConverge<P extends XYWritable>(
  outHits: IntersectionHit<P>[],
  tA0: number,
  tA1: number,
  tB0: number,
  tB1: number,
  origA: QuadFlat,
  bSub: CubicFlat,
  epsilon: number,
  epsilonT: number,
  makePoint: () => P
): void {
  const spanA = tA1 - tA0;
  const spanB = tB1 - tB0;
  // maxDepth에서 멈춘 midpoint는 span 수준 오차가 남으므로 Newton이나 끝점 snap으로 다듬는다
  const [tA, tB] = resolveIntersectionParams(
    (t, out) => evalQuadraticInto(origA, t, out),
    subCurveEvaluator(evalCubicInto, bSub, tB0, spanB),
    tA0,
    tA1,
    tB0,
    tB1,
    epsilon
  );
  const [oA0x, oA0y, oA1x, oA1y, oA2x, oA2y] = origA;
  const mt = 1 - tA;
  const mt2 = mt * mt;
  const t2 = tA * tA;
  const px = mt2 * oA0x + 2 * mt * tA * oA1x + t2 * oA2x;
  const py = mt2 * oA0y + 2 * mt * tA * oA1y + t2 * oA2y;
  // 교차 종류는 다듬은 parameter의 tangent로 판정한다. 같은 근으로 모이는 box가 모두 같은 kind를 얻는다
  const [taxDx, taxDy] = quadraticTangent(oA0x, oA0y, oA1x, oA1y, oA2x, oA2y, tA);
  // curve B(cubic) tangent — bSub local parameter로 환산해 계산한다
  const [tbxDx, tbxDy] = cubicTangent(
    bSub[0],
    bSub[1],
    bSub[2],
    bSub[3],
    bSub[4],
    bSub[5],
    bSub[6],
    bSub[7],
    spanB > 0 ? (tB - tB0) / spanB : 0.5
  );
  const kindEpsilon = Math.max(epsilon, SUBDIVISION_KIND_EPSILON_FACTOR * Math.max(spanA, spanB));
  const kind = classifyIntersectionKind(taxDx, taxDy, tbxDx, tbxDy, kindEpsilon);
  const dedupeT = Math.max(epsilonT, SUBDIVISION_DEDUPE_T_FACTOR * Math.max(spanA, spanB));
  pushHitIfNewAB(outHits, px, py, kind, tA, tB, dedupeT, makePoint);
}

/**
 * quadratic Bezier curve와 cubic Bezier curve 간 교차점을 outHits에 push한다.
 *
 * subdivision 재귀로 parameter box를 좁혀 교차점을 탐지한다.
 * tA는 quadratic curve A의 parameter, tB는 cubic curve B의 parameter이다.
 * 수렴 지점은 다듬어 기록한다. 끝점이 상대 curve 위에 있으면 끝점 parameter(0, 1)로 snap하고, 아니면 Newton으로 다듬는다.
 * hit point는 다듬은 parameter로 curve A 위에서 계산한다.
 * 두 curve가 같은 기하 위에서 구간을 공유하면 겹침 구간 양 끝점을 `kind: 'overlap'` hit 2건으로 기록한다.
 * 겹침 구간 내부는 subdivision하지 않는다. 겹침 밖의 교차는 그대로 탐지한다.
 *
 * @param outHits 결과 배열 (함수 호출 전 비워야 한다)
 * @param p0 quadratic curve A 시작점
 * @param p1 quadratic curve A 제어점
 * @param p2 quadratic curve A 끝점
 * @param q0 cubic curve B 시작점
 * @param q1 cubic curve B 첫 번째 제어점
 * @param q2 cubic curve B 두 번째 제어점
 * @param q3 cubic curve B 끝점
 * @param options intersection kernel 옵션
 */
export function quadraticCubicIntersectionsInto<P extends XYWritable = XYObjectWritable>(
  outHits: IntersectionHit<P>[],
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  q0: XYInput,
  q1: XYInput,
  q2: XYInput,
  q3: XYInput,
  options?: CurveIntersectionOptions
): void {
  outHits.length = 0;
  const { epsilon, epsilonT } = resolveOptions(options);
  const maxDepth = options?.maxDepth ?? DEFAULT_MAX_DEPTH;
  const makePoint = () => ({ x: 0, y: 0 }) as unknown as P;

  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);

  const origA: QuadFlat = [p0x, p0y, p1x, p1y, p2x, p2y];
  const aSub: QuadFlat = [p0x, p0y, p1x, p1y, p2x, p2y];
  const bSub: CubicFlat = [readX(q0), readY(q0), readX(q1), readY(q1), readX(q2), readY(q2), readX(q3), readY(q3)];

  // 같은 기하 위 겹침 구간은 subdivision이 모든 box를 hit로 쪼개므로 먼저 끝점 2건으로 기록한다
  const overlapA = quadraticOverlapCurve(origA);
  const overlap = findCurveOverlap(overlapA, cubicOverlapCurve(bSub), epsilon);
  if (overlap !== null) pushOverlapHits(outHits, overlap, overlapA, makePoint);

  subdivideCurves(outHits, aSub, 0, 1, bSub, 0, 1, origA, epsilon, epsilonT, maxDepth, 0, makePoint, {
    hullBoundsA: (sub: QuadFlat) => quadraticHullBounds(...sub),
    hullBoundsB: (sub: CubicFlat) => cubicHullBounds(...sub),
    splitA: (sub: QuadFlat) => splitQuadratic(...sub),
    splitB: (sub: CubicFlat) => splitCubic(...sub),
    skipBox: overlap === null ? undefined : overlapBoxFilter(overlap),
    onConverge,
  });
}
