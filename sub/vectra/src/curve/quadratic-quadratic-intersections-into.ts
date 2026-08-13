import { readX, readY } from '../internal/xy';
import type { CurveIntersectionOptions, IntersectionHit, XYInput, XYObjectWritable, XYWritable } from '../types';
import {
  classifyIntersectionKind,
  DEFAULT_MAX_DEPTH,
  pushHitIfNewAB,
  type QuadFlat,
  quadraticHullBounds,
  quadraticTangent,
  resolveOptions,
  SUBDIVISION_DEDUPE_T_FACTOR,
  SUBDIVISION_KIND_EPSILON_FACTOR,
  splitQuadratic,
  subdivideCurves,
} from './curve-intersections.internal';

/**
 * quadratic × quadratic subdivision 수렴 시 교차점을 계산해 outHits에 push한다.
 * curve A 위 tAMid에서 원본 좌표로 정밀 계산하고, curve B tangent는 bSub local midpoint로 근사한다.
 */
function onConverge<P extends XYWritable>(
  outHits: IntersectionHit<P>[],
  tA0: number,
  tA1: number,
  tB0: number,
  tB1: number,
  origA: QuadFlat,
  bSub: QuadFlat,
  epsilon: number,
  epsilonT: number,
  makePoint: () => P
): void {
  // 교차점은 원본 curve A의 midpoint parameter로 계산한다
  const tAMid = (tA0 + tA1) * 0.5;
  const tBMid = (tB0 + tB1) * 0.5;
  const spanA = tA1 - tA0;
  const spanB = tB1 - tB0;
  const [oA0x, oA0y, oA1x, oA1y, oA2x, oA2y] = origA;
  const mt = 1 - tAMid;
  const mt2 = mt * mt;
  const t2 = tAMid * tAMid;
  const px = mt2 * oA0x + 2 * mt * tAMid * oA1x + t2 * oA2x;
  const py = mt2 * oA0y + 2 * mt * tAMid * oA1y + t2 * oA2y;
  // tangent 비교로 교차 종류 판정
  const [taxDx, taxDy] = quadraticTangent(oA0x, oA0y, oA1x, oA1y, oA2x, oA2y, tAMid);
  const [tbxDx, tbxDy] = quadraticTangent(bSub[0], bSub[1], bSub[2], bSub[3], bSub[4], bSub[5], 0.5);
  const kindEpsilon = Math.max(epsilon, SUBDIVISION_KIND_EPSILON_FACTOR * Math.max(spanA, spanB));
  const kind = classifyIntersectionKind(taxDx, taxDy, tbxDx, tbxDy, kindEpsilon);
  const dedupeT = Math.max(epsilonT, SUBDIVISION_DEDUPE_T_FACTOR * Math.max(spanA, spanB));
  pushHitIfNewAB(outHits, px, py, kind, tAMid, tBMid, dedupeT, makePoint);
}

/**
 * 두 quadratic Bezier curve 간 교차점을 outHits에 push한다.
 *
 * subdivision 재귀로 parameter box를 좁혀 교차점을 탐지한다.
 * hit point는 curve A 위 midpoint parameter로 계산한다.
 * dedupe 기준: |tA1-tA2| <= epsilonT && |tB1-tB2| <= epsilonT.
 *
 * @param outHits 결과 배열 (함수 호출 전 비워야 한다)
 * @param p0 curve A 시작점
 * @param p1 curve A 제어점
 * @param p2 curve A 끝점
 * @param q0 curve B 시작점
 * @param q1 curve B 제어점
 * @param q2 curve B 끝점
 * @param options intersection kernel 옵션
 */
export function quadraticQuadraticIntersectionsInto<P extends XYWritable = XYObjectWritable>(
  outHits: IntersectionHit<P>[],
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  q0: XYInput,
  q1: XYInput,
  q2: XYInput,
  options?: CurveIntersectionOptions
): void {
  outHits.length = 0;
  const { epsilon, epsilonT } = resolveOptions(options);
  const maxDepth = options?.maxDepth ?? DEFAULT_MAX_DEPTH;
  // 기본 point factory: XYObjectWritable 형태로 생성한다
  const makePoint = () => ({ x: 0, y: 0 }) as unknown as P;

  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);

  const origA: QuadFlat = [p0x, p0y, p1x, p1y, p2x, p2y];
  const aSub: QuadFlat = [p0x, p0y, p1x, p1y, p2x, p2y];
  const bSub: QuadFlat = [readX(q0), readY(q0), readX(q1), readY(q1), readX(q2), readY(q2)];

  subdivideCurves(outHits, aSub, 0, 1, bSub, 0, 1, origA, epsilon, epsilonT, maxDepth, 0, makePoint, {
    hullBoundsA: (sub: QuadFlat) => quadraticHullBounds(...sub),
    hullBoundsB: (sub: QuadFlat) => quadraticHullBounds(...sub),
    splitA: (sub: QuadFlat) => splitQuadratic(...sub),
    splitB: (sub: QuadFlat) => splitQuadratic(...sub),
    onConverge,
  });
}
