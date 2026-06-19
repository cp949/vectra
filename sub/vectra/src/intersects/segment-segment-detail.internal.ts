import type { SegmentSegmentDetail } from '../types';
import {
  addCandidate,
  type CollinearCandidate,
  type CollinearCandidateContext,
  type CollinearMappedInterval,
  collinearMappedInterval,
  collinearOverlapCandidates,
  collinearOverlapFromMappedInterval,
  collinearSortAxis,
} from './segment-segment-collinear.internal';
import {
  intersectionParameters,
  intersectionParametersFromEndpoints,
  intersectionPointFromParams,
  rawCrossParams,
} from './segment-segment-crossing.internal';
import { degenerateSegmentSegmentDetail } from './segment-segment-degenerate.internal';
import {
  agreesWithEndpointParameter,
  allFinite,
  axisProjectedLineDist,
  clamp01,
  cross2,
  interpolateCoord,
  interpolationScale,
  normalizeZero,
  parameterOnSegmentPoint,
  pointAgreesWithSegment,
  pointLineDist,
  pointPointDist,
  segmentEndpointsCollinearWithinDistance,
} from './segment-segment-geometry.internal';

// 분기 helper를 한 진입점에서 re-export하는 배럴 역할. 소비처 import 경로 './segment-segment-detail.internal' 보존.
export {
  addCandidate,
  agreesWithEndpointParameter,
  allFinite,
  axisProjectedLineDist,
  type CollinearCandidate,
  type CollinearCandidateContext,
  type CollinearMappedInterval,
  clamp01,
  collinearMappedInterval,
  collinearOverlapCandidates,
  collinearOverlapFromMappedInterval,
  collinearSortAxis,
  cross2,
  degenerateSegmentSegmentDetail,
  interpolateCoord,
  interpolationScale,
  intersectionParameters,
  intersectionParametersFromEndpoints,
  intersectionPointFromParams,
  normalizeZero,
  parameterOnSegmentPoint,
  pointAgreesWithSegment,
  pointLineDist,
  pointPointDist,
  rawCrossParams,
  segmentEndpointsCollinearWithinDistance,
};

/** 매 호출 fresh none result를 반환한다. 공유 상수를 재사용하지 않는다. */
function none(): SegmentSegmentDetail {
  return { kind: 'none' };
}

/**
 * raw 좌표로 두 segment의 교차 detail을 계산한다.
 *
 * non-parallel 단일 교점의 range 여부는 boolean `intersectsSegmentSegment`와 같은 raw range 식으로
 * 판정하고, 반환 좌표가 두 segment와 epsilon 이내로 일치하는지 한 번 더 확인한다.
 * collinearity는 epsilon 거리로 판정하고, collinear overlap 여부도 boolean과 동일한 raw range로
 * 판정한 뒤 좌표/구간을 scale-aware epsilon agreement로 보정한다.
 * tolerance로 한 점에 수렴한 collinear overlap은 `point`로 분류한다.
 * cross가 overflow로 non-finite가 되는 좌표에서는 scale-aware fallback이라 boolean보다 정확하게 갈릴 수 있다.
 * 반환 object는 매 호출 새로 만든 plain object이며 입력 좌표 object를 재사용하지 않는다.
 *
 * @param ax0 segment a 시작점 x
 * @param ay0 segment a 시작점 y
 * @param ax1 segment a 끝점 x
 * @param ay1 segment a 끝점 y
 * @param bx0 segment b 시작점 x
 * @param by0 segment b 시작점 y
 * @param bx1 segment b 끝점 x
 * @param by1 segment b 끝점 y
 * @param epsilon 평행 판정 및 거리 임계값
 */
export function segmentSegmentDetailXY(
  ax0: number,
  ay0: number,
  ax1: number,
  ay1: number,
  bx0: number,
  by0: number,
  bx1: number,
  by1: number,
  epsilon: number
): SegmentSegmentDetail {
  if (!allFinite(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1, epsilon)) return none();

  const adx = ax1 - ax0;
  const ady = ay1 - ay0;
  const bdx = bx1 - bx0;
  const bdy = by1 - by0;

  const degen = degenerateSegmentSegmentDetail(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1, epsilon);
  if (degen !== undefined) return degen;

  const qx = bx0 - ax0;
  const qy = by0 - ay0;
  const cross = adx * bdy - ady * bdx;
  const params =
    intersectionParameters(qx, qy, adx, ady, bdx, bdy) ??
    intersectionParametersFromEndpoints(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1);
  const collinearByDistance = segmentEndpointsCollinearWithinDistance(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1, epsilon);
  // cross가 epsilon보다 크면 단일 교점, overflow로 non-finite여도 scaled params가 있으면 단일 교점이다.
  const nonParallel = Math.abs(cross) > epsilon || (!Number.isFinite(cross) && params !== undefined);

  if (!collinearByDistance && nonParallel) {
    // non-parallel: 단일 교점.
    // range 여부는 boolean intersectsSegmentSegment와 같은 raw range 비교로 판정한다.
    // cross가 finite하면 boolean과 동일한 raw t/u 식으로 계산해 경계 ULP 불일치를 없앤다.
    // cross가 overflow(non-finite)면 raw 식이 무의미하므로 scaled params로 fallback한다.
    // 반환 좌표는 두 segment와 epsilon 이내로 일치해야 한다.
    if (params === undefined) return none();
    let tA: number;
    let tB: number;
    if (Number.isFinite(cross)) {
      ({ tA, tB } = rawCrossParams(qx, qy, adx, ady, bdx, bdy, cross));
    } else {
      tA = params.tA;
      tB = params.tB;
    }
    if (!allFinite(tA, tB) || tA < 0 || tA > 1 || tB < 0 || tB > 1) return none();
    const point = intersectionPointFromParams(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1, tA, tB, epsilon);
    if (point === undefined) return none();
    const { x, y } = point;
    if (!allFinite(x, y)) return none();
    return { kind: 'point', point: { x, y }, tA: normalizeZero(tA), tB: normalizeZero(tB) };
  }

  // collinearByDistance가 finite cross의 non-parallel 분기를 가로챈 경우,
  // boolean intersectsSegmentSegment는 여전히 raw t/u range로 hit를 판정한다.
  // range 밖이면 boolean은 false이므로 가짜 overlap을 만들지 않고 none을 반환한다.
  // overflow(non-finite cross)에서는 raw 식이 무의미하므로 이 gate를 건너뛴다.
  if (collinearByDistance && Number.isFinite(cross) && Math.abs(cross) > epsilon) {
    const { tA, tB } = rawCrossParams(qx, qy, adx, ady, bdx, bdy, cross);
    if (!allFinite(tA, tB) || tA < 0 || tA > 1 || tB < 0 || tB > 1) return none();
  }

  // parallel: collinearity를 b origin의 a까지 perpendicular distance로 판정한다
  const tBo = parameterOnSegmentPoint(bx0, by0, ax0, ay0, ax1, ay1);
  if (!Number.isFinite(tBo)) return none();
  const dist = pointLineDist(bx0, by0, ax0, ay0, ax1, ay1);
  if (!Number.isFinite(dist) || dist > epsilon) return none();

  const mappedInterval = collinearMappedInterval(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1, tBo);
  if (mappedInterval === null) return none();

  const candidates = collinearOverlapCandidates(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1, epsilon);
  if (candidates.length === 0) {
    if (mappedInterval === undefined) return none();
    return collinearOverlapFromMappedInterval(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1, mappedInterval, epsilon);
  }
  // 후보는 range/agreement/dedup gate를 거쳐 overlap 경계인 최대 2개만 남는다.
  // 마지막 후보를 end로 잡아 향후 gate 완화에도 안전하게 둔다(length === 1이면 start === end).
  const start = candidates[0];
  const end = candidates[candidates.length - 1];

  const overlapDistance = pointPointDist(start.x, start.y, end.x, end.y);
  if (candidates.length === 1 || overlapDistance <= epsilon) {
    // tolerance로 한 점에 수렴한 overlap은 point로 분류한다
    return { kind: 'point', point: { x: start.x, y: start.y }, tA: start.tA, tB: start.tB };
  }

  return {
    kind: 'overlap',
    start: { x: start.x, y: start.y },
    end: { x: end.x, y: end.y },
    tA: [start.tA, end.tA],
    tB: [start.tB, end.tB],
  };
}
