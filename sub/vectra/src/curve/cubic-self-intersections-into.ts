import { readX, readY } from '../internal/xy';
import type { CurveIntersectionOptions, IntersectionHit, XYInput, XYObjectWritable, XYWritable } from '../types';
import { cubicClassify } from './cubic-classify';
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
 * self-intersection 탐지용 subdivision 재귀 kernel.
 * curveLeft(tA ∈ [tA0, tA1])와 curveRight(tB ∈ [tB0, tB1])의 교차를 탐색한다.
 * split boundary(tA1 ≈ tB0 ≈ 0.5)에서만 만나는 hit는 제거한다.
 */
function subdivideSelf<P extends XYWritable>(
  outHits: IntersectionHit<P>[],
  leftSub: CubicFlat,
  tA0: number,
  tA1: number,
  rightSub: CubicFlat,
  tB0: number,
  tB1: number,
  // 원본 cubic curve A 좌표 — 수렴 시 교차점 계산에 사용한다
  origA: CubicFlat,
  epsilon: number,
  epsilonT: number,
  maxDepth: number,
  depth: number,
  makePoint: () => P
): void {
  const [aMinX, aMinY, aMaxX, aMaxY] = cubicHullBounds(
    leftSub[0],
    leftSub[1],
    leftSub[2],
    leftSub[3],
    leftSub[4],
    leftSub[5],
    leftSub[6],
    leftSub[7]
  );
  const [bMinX, bMinY, bMaxX, bMaxY] = cubicHullBounds(
    rightSub[0],
    rightSub[1],
    rightSub[2],
    rightSub[3],
    rightSub[4],
    rightSub[5],
    rightSub[6],
    rightSub[7]
  );

  if (!boundsOverlap(aMinX, aMinY, aMaxX, aMaxY, bMinX, bMinY, bMaxX, bMaxY, epsilon)) return;

  const spanA = tA1 - tA0;
  const spanB = tB1 - tB0;

  const isConverged = spanA <= epsilonT && spanB <= epsilonT;
  if (isConverged || depth >= maxDepth) {
    const tAMid = (tA0 + tA1) * 0.5;
    const tBMid = (tB0 + tB1) * 0.5;

    // split boundary hit 제거 — 두 half가 만나는 공유 경계(t=0.5)에서만 만나는 false hit를 버린다
    // span이 클 때도 안정적으로 필터하기 위해 현재 span과 epsilonT 중 큰 값을 사용한다
    const boundaryThresh = Math.max(epsilonT, spanA, spanB);
    if (Math.abs(tAMid - 0.5) <= boundaryThresh && Math.abs(tBMid - 0.5) <= boundaryThresh) return;

    // endpoint-to-endpoint hit 제거 — p0=p3인 closed loop에서 t=0과 t=1이 만나는 false hit를 버린다
    if (tAMid <= epsilonT && tBMid >= 1 - epsilonT) return;

    const [oA0x, oA0y, oA1x, oA1y, oA2x, oA2y, oA3x, oA3y] = origA;

    // tA 기준 curve point 계산
    const mtA = 1 - tAMid;
    const mtA2 = mtA * mtA;
    const mtA3 = mtA2 * mtA;
    const tA2 = tAMid * tAMid;
    const tA3 = tA2 * tAMid;
    const px = mtA3 * oA0x + 3 * mtA2 * tAMid * oA1x + 3 * mtA * tA2 * oA2x + tA3 * oA3x;
    const py = mtA3 * oA0y + 3 * mtA2 * tAMid * oA1y + 3 * mtA * tA2 * oA2y + tA3 * oA3y;

    // tB 기준 curve point 계산
    const mtB = 1 - tBMid;
    const mtB2 = mtB * mtB;
    const mtB3 = mtB2 * mtB;
    const tB2 = tBMid * tBMid;
    const tB3 = tB2 * tBMid;
    const qx = mtB3 * oA0x + 3 * mtB2 * tBMid * oA1x + 3 * mtB * tB2 * oA2x + tB3 * oA3x;
    const qy = mtB3 * oA0y + 3 * mtB2 * tBMid * oA1y + 3 * mtB * tB2 * oA2y + tB3 * oA3y;
    const dist2 = (px - qx) * (px - qx) + (py - qy) * (py - qy);
    // 수렴 완료(isConverged) 시에만 dist2 필터를 적용한다.
    // maxDepth 도달 시에는 span이 아직 클 수 있으므로 false hit 필터를 bypass하고 항상 push한다.
    if (isConverged && dist2 > epsilon) return;

    const [taxDx, taxDy] = cubicTangent(oA0x, oA0y, oA1x, oA1y, oA2x, oA2y, oA3x, oA3y, tAMid);
    const [tbxDx, tbxDy] = cubicTangent(oA0x, oA0y, oA1x, oA1y, oA2x, oA2y, oA3x, oA3y, tBMid);
    const kindEpsilon = Math.max(epsilon, SUBDIVISION_KIND_EPSILON_FACTOR * Math.max(spanA, spanB));
    const kind = classifyIntersectionKind(taxDx, taxDy, tbxDx, tbxDy, kindEpsilon);
    const dedupeT = Math.max(epsilonT, SUBDIVISION_DEDUPE_T_FACTOR * Math.max(spanA, spanB));
    pushHitIfNewAB(outHits, px, py, kind, tAMid, tBMid, dedupeT, makePoint);
    return;
  }

  if (spanA >= spanB) {
    const tAMid = (tA0 + tA1) * 0.5;
    const [leftL, leftR] = splitCubic(
      leftSub[0],
      leftSub[1],
      leftSub[2],
      leftSub[3],
      leftSub[4],
      leftSub[5],
      leftSub[6],
      leftSub[7]
    );
    subdivideSelf(
      outHits,
      leftL,
      tA0,
      tAMid,
      rightSub,
      tB0,
      tB1,
      origA,
      epsilon,
      epsilonT,
      maxDepth,
      depth + 1,
      makePoint
    );
    subdivideSelf(
      outHits,
      leftR,
      tAMid,
      tA1,
      rightSub,
      tB0,
      tB1,
      origA,
      epsilon,
      epsilonT,
      maxDepth,
      depth + 1,
      makePoint
    );
  } else {
    const tBMid = (tB0 + tB1) * 0.5;
    const [rightL, rightR] = splitCubic(
      rightSub[0],
      rightSub[1],
      rightSub[2],
      rightSub[3],
      rightSub[4],
      rightSub[5],
      rightSub[6],
      rightSub[7]
    );
    subdivideSelf(
      outHits,
      leftSub,
      tA0,
      tA1,
      rightL,
      tB0,
      tBMid,
      origA,
      epsilon,
      epsilonT,
      maxDepth,
      depth + 1,
      makePoint
    );
    subdivideSelf(
      outHits,
      leftSub,
      tA0,
      tA1,
      rightR,
      tBMid,
      tB1,
      origA,
      epsilon,
      epsilonT,
      maxDepth,
      depth + 1,
      makePoint
    );
  }
}

/**
 * cubic Bezier curve의 자기 교차점을 outHits에 push한다.
 *
 * t=0.5에서 curve를 두 half로 분할한 뒤 두 half 사이의 교차를 subdivision으로 탐지한다.
 * split boundary(두 half가 공유하는 t=0.5 경계)에서만 만나는 hit는 제거한다.
 * self-intersection이 없는 curve(S-curve 등)에서는 빈 배열을 반환한다.
 *
 * @param outHits 결과 배열 (함수 호출 전 비워야 한다)
 * @param p0 curve 시작점
 * @param p1 curve 첫 번째 제어점
 * @param p2 curve 두 번째 제어점
 * @param p3 curve 끝점
 * @param options intersection kernel 옵션
 */
export function cubicSelfIntersectionsInto<P extends XYWritable = XYObjectWritable>(
  outHits: IntersectionHit<P>[],
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  options?: CurveIntersectionOptions
): void {
  outHits.length = 0;

  // loop 형태가 아닌 cubic은 자기 교차점이 없다 — early exit으로 false hit를 방지한다
  if (cubicClassify(p0, p1, p2, p3) !== 'loop') return;

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

  // t=0.5에서 분할 — left가 [0,0.5], right가 [0.5,1] 구간을 담당한다
  const [leftHalf, rightHalf] = splitCubic(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y);

  subdivideSelf(outHits, leftHalf, 0, 0.5, rightHalf, 0.5, 1, origA, epsilon, epsilonT, maxDepth, 0, makePoint);
}
