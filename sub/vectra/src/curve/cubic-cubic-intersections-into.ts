import { readX, readY } from '../internal/xy';
import type { CurveIntersectionOptions, IntersectionHit, XYInput, XYObjectWritable, XYWritable } from '../types';
import {
  boundsOverlap,
  classifyIntersectionKind,
  cubicHullBounds,
  cubicTangent,
  DEFAULT_MAX_DEPTH,
  pushHitIfNewAB,
  resolveOptions,
  SUBDIVISION_DEDUPE_T_FACTOR,
  SUBDIVISION_KIND_EPSILON_FACTOR,
} from './curve-intersections.internal';

/** cubic sub-curve flat 좌표 — [p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y]. */
type CubicFlat = [number, number, number, number, number, number, number, number];

/**
 * cubic Bezier를 t=0.5에서 De Casteljau 분할한다.
 */
function splitCubic(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  p3x: number,
  p3y: number
): [CubicFlat, CubicFlat] {
  const m01x = (p0x + p1x) * 0.5;
  const m01y = (p0y + p1y) * 0.5;
  const m12x = (p1x + p2x) * 0.5;
  const m12y = (p1y + p2y) * 0.5;
  const m23x = (p2x + p3x) * 0.5;
  const m23y = (p2y + p3y) * 0.5;
  const m012x = (m01x + m12x) * 0.5;
  const m012y = (m01y + m12y) * 0.5;
  const m123x = (m12x + m23x) * 0.5;
  const m123y = (m12y + m23y) * 0.5;
  const mx = (m012x + m123x) * 0.5;
  const my = (m012y + m123y) * 0.5;
  return [
    [p0x, p0y, m01x, m01y, m012x, m012y, mx, my],
    [mx, my, m123x, m123y, m23x, m23y, p3x, p3y],
  ];
}

/**
 * cubic × cubic subdivision 재귀 kernel.
 */
function subdivide<P extends XYWritable>(
  outHits: IntersectionHit<P>[],
  aSub: CubicFlat,
  tA0: number,
  tA1: number,
  bSub: CubicFlat,
  tB0: number,
  tB1: number,
  // 원본 curve A 좌표 — 수렴 시 교차점 계산에 사용한다
  origA: CubicFlat,
  epsilon: number,
  epsilonT: number,
  maxDepth: number,
  depth: number,
  makePoint: () => P
): void {
  const [aMinX, aMinY, aMaxX, aMaxY] = cubicHullBounds(
    aSub[0],
    aSub[1],
    aSub[2],
    aSub[3],
    aSub[4],
    aSub[5],
    aSub[6],
    aSub[7]
  );
  const [bMinX, bMinY, bMaxX, bMaxY] = cubicHullBounds(
    bSub[0],
    bSub[1],
    bSub[2],
    bSub[3],
    bSub[4],
    bSub[5],
    bSub[6],
    bSub[7]
  );

  if (!boundsOverlap(aMinX, aMinY, aMaxX, aMaxY, bMinX, bMinY, bMaxX, bMaxY, epsilon)) return;

  const spanA = tA1 - tA0;
  const spanB = tB1 - tB0;

  if ((spanA <= epsilonT && spanB <= epsilonT) || depth >= maxDepth) {
    const tAMid = (tA0 + tA1) * 0.5;
    const tBMid = (tB0 + tB1) * 0.5;
    const [oA0x, oA0y, oA1x, oA1y, oA2x, oA2y, oA3x, oA3y] = origA;
    const mt = 1 - tAMid;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = tAMid * tAMid;
    const t3 = t2 * tAMid;
    const px = mt3 * oA0x + 3 * mt2 * tAMid * oA1x + 3 * mt * t2 * oA2x + t3 * oA3x;
    const py = mt3 * oA0y + 3 * mt2 * tAMid * oA1y + 3 * mt * t2 * oA2y + t3 * oA3y;
    // tangent 비교로 교차 종류 판정
    const [taxDx, taxDy] = cubicTangent(oA0x, oA0y, oA1x, oA1y, oA2x, oA2y, oA3x, oA3y, tAMid);
    const [tbxDx, tbxDy] = cubicTangent(bSub[0], bSub[1], bSub[2], bSub[3], bSub[4], bSub[5], bSub[6], bSub[7], 0.5);
    const kindEpsilon = Math.max(epsilon, SUBDIVISION_KIND_EPSILON_FACTOR * Math.max(spanA, spanB));
    const kind = classifyIntersectionKind(taxDx, taxDy, tbxDx, tbxDy, kindEpsilon);
    const dedupeT = Math.max(epsilonT, SUBDIVISION_DEDUPE_T_FACTOR * Math.max(spanA, spanB));
    pushHitIfNewAB(outHits, px, py, kind, tAMid, tBMid, dedupeT, makePoint);
    return;
  }

  if (spanA >= spanB) {
    const tAMid = (tA0 + tA1) * 0.5;
    const [leftA, rightA] = splitCubic(aSub[0], aSub[1], aSub[2], aSub[3], aSub[4], aSub[5], aSub[6], aSub[7]);
    subdivide(outHits, leftA, tA0, tAMid, bSub, tB0, tB1, origA, epsilon, epsilonT, maxDepth, depth + 1, makePoint);
    subdivide(outHits, rightA, tAMid, tA1, bSub, tB0, tB1, origA, epsilon, epsilonT, maxDepth, depth + 1, makePoint);
  } else {
    const tBMid = (tB0 + tB1) * 0.5;
    const [leftB, rightB] = splitCubic(bSub[0], bSub[1], bSub[2], bSub[3], bSub[4], bSub[5], bSub[6], bSub[7]);
    subdivide(outHits, aSub, tA0, tA1, leftB, tB0, tBMid, origA, epsilon, epsilonT, maxDepth, depth + 1, makePoint);
    subdivide(outHits, aSub, tA0, tA1, rightB, tBMid, tB1, origA, epsilon, epsilonT, maxDepth, depth + 1, makePoint);
  }
}

/**
 * 두 cubic Bezier curve 간 교차점을 outHits에 push한다.
 *
 * subdivision 재귀로 parameter box를 좁혀 교차점을 탐지한다.
 * hit point는 curve A 위 midpoint parameter로 계산한다.
 * dedupe 기준: |tA1-tA2| <= epsilonT && |tB1-tB2| <= epsilonT.
 *
 * @param outHits 결과 배열 (함수 호출 전 비워야 한다)
 * @param p0 curve A 시작점
 * @param p1 curve A 첫 번째 제어점
 * @param p2 curve A 두 번째 제어점
 * @param p3 curve A 끝점
 * @param q0 curve B 시작점
 * @param q1 curve B 첫 번째 제어점
 * @param q2 curve B 두 번째 제어점
 * @param q3 curve B 끝점
 * @param options intersection kernel 옵션
 */
export function cubicCubicIntersectionsInto<P extends XYWritable = XYObjectWritable>(
  outHits: IntersectionHit<P>[],
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
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
  const p3x = readX(p3);
  const p3y = readY(p3);

  const origA: CubicFlat = [p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y];
  const aSub: CubicFlat = [p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y];
  const bSub: CubicFlat = [readX(q0), readY(q0), readX(q1), readY(q1), readX(q2), readY(q2), readX(q3), readY(q3)];

  subdivide(outHits, aSub, 0, 1, bSub, 0, 1, origA, epsilon, epsilonT, maxDepth, 0, makePoint);
}
