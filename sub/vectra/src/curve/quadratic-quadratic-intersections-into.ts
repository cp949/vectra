import { readX, readY } from '../internal/xy';
import type { CurveIntersectionOptions, IntersectionHit, XYInput, XYObjectWritable, XYWritable } from '../types';
import {
  boundsOverlap,
  classifyIntersectionKind,
  DEFAULT_MAX_DEPTH,
  pushHitIfNewAB,
  quadraticHullBounds,
  quadraticTangent,
  resolveOptions,
  SUBDIVISION_DEDUPE_T_FACTOR,
  SUBDIVISION_KIND_EPSILON_FACTOR,
} from './curve-intersections.internal';

/**
 * quadratic Bezier sub-curve의 flat x/y 좌표 배열.
 * [p0x, p0y, p1x, p1y, p2x, p2y] 순서로 표현한다.
 */
type QuadFlat = [number, number, number, number, number, number];

/**
 * quadratic Bezier를 t=0.5에서 두 half로 분할한다.
 * De Casteljau subdivision을 사용한다.
 */
function splitQuadratic(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number
): [QuadFlat, QuadFlat] {
  const m01x = (p0x + p1x) * 0.5;
  const m01y = (p0y + p1y) * 0.5;
  const m12x = (p1x + p2x) * 0.5;
  const m12y = (p1y + p2y) * 0.5;
  const mx = (m01x + m12x) * 0.5;
  const my = (m01y + m12y) * 0.5;
  return [
    [p0x, p0y, m01x, m01y, mx, my],
    [mx, my, m12x, m12y, p2x, p2y],
  ];
}

/**
 * quadratic × quadratic subdivision 재귀 kernel.
 * 두 sub-curve의 hull bound가 겹치지 않으면 branch를 중단한다.
 * 수렴 시 교차점을 pushHitIfNewAB로 기록한다.
 */
function subdivide<P extends XYWritable>(
  outHits: IntersectionHit<P>[],
  aSub: QuadFlat,
  tA0: number,
  tA1: number,
  bSub: QuadFlat,
  tB0: number,
  tB1: number,
  // 원본 curve A 좌표 — 수렴 시 교차점 계산에 사용한다
  origA: QuadFlat,
  epsilon: number,
  epsilonT: number,
  maxDepth: number,
  depth: number,
  makePoint: () => P
): void {
  const [aMinX, aMinY, aMaxX, aMaxY] = quadraticHullBounds(aSub[0], aSub[1], aSub[2], aSub[3], aSub[4], aSub[5]);
  const [bMinX, bMinY, bMaxX, bMaxY] = quadraticHullBounds(bSub[0], bSub[1], bSub[2], bSub[3], bSub[4], bSub[5]);

  if (!boundsOverlap(aMinX, aMinY, aMaxX, aMaxY, bMinX, bMinY, bMaxX, bMaxY, epsilon)) return;

  const spanA = tA1 - tA0;
  const spanB = tB1 - tB0;

  if ((spanA <= epsilonT && spanB <= epsilonT) || depth >= maxDepth) {
    // 교차점은 원본 curve A의 midpoint parameter로 계산한다
    const tAMid = (tA0 + tA1) * 0.5;
    const tBMid = (tB0 + tB1) * 0.5;
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
    return;
  }

  // span이 더 큰 쪽을 분할한다
  if (spanA >= spanB) {
    const tAMid = (tA0 + tA1) * 0.5;
    const [leftA, rightA] = splitQuadratic(aSub[0], aSub[1], aSub[2], aSub[3], aSub[4], aSub[5]);
    subdivide(outHits, leftA, tA0, tAMid, bSub, tB0, tB1, origA, epsilon, epsilonT, maxDepth, depth + 1, makePoint);
    subdivide(outHits, rightA, tAMid, tA1, bSub, tB0, tB1, origA, epsilon, epsilonT, maxDepth, depth + 1, makePoint);
  } else {
    const tBMid = (tB0 + tB1) * 0.5;
    const [leftB, rightB] = splitQuadratic(bSub[0], bSub[1], bSub[2], bSub[3], bSub[4], bSub[5]);
    subdivide(outHits, aSub, tA0, tA1, leftB, tB0, tBMid, origA, epsilon, epsilonT, maxDepth, depth + 1, makePoint);
    subdivide(outHits, aSub, tA0, tA1, rightB, tBMid, tB1, origA, epsilon, epsilonT, maxDepth, depth + 1, makePoint);
  }
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

  subdivide(outHits, aSub, 0, 1, bSub, 0, 1, origA, epsilon, epsilonT, maxDepth, 0, makePoint);
}
