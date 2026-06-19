import type { SegmentSegmentDetail } from '../types';
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

export {
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
};
export { degenerateSegmentSegmentDetail };

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

function intersectionPointFromParams(
  ax0: number,
  ay0: number,
  ax1: number,
  ay1: number,
  bx0: number,
  by0: number,
  bx1: number,
  by1: number,
  tA: number,
  tB: number,
  epsilon: number
): { x: number; y: number } | undefined {
  const aPoint = { x: interpolateCoord(ax0, ax1, tA), y: interpolateCoord(ay0, ay1, tA) };
  const bPoint = { x: interpolateCoord(bx0, bx1, tB), y: interpolateCoord(by0, by1, tB) };
  const aScale = interpolationScale(ax0, ay0, ax1, ay1);
  const bScale = interpolationScale(bx0, by0, bx1, by1);
  // 더 작은 scale segment 보간점이 cancellation에 강하므로 우선 선택한다.
  // 반대 segment parameter는 대좌표에서 0/1로 반올림될 수 있다.
  // 선택한 점이 자기 segment 내부점에서 나온 경우에만 반대 segment endpoint 반올림을 허용한다.
  if (Number.isFinite(bPoint.x) && Number.isFinite(bPoint.y) && bScale < aScale) {
    if (!pointAgreesWithSegment(bPoint.x, bPoint.y, bx0, by0, bx1, by1, tB, epsilon, false)) return undefined;
    if (!pointAgreesWithSegment(bPoint.x, bPoint.y, ax0, ay0, ax1, ay1, tA, epsilon, tB !== 0 && tB !== 1)) {
      return undefined;
    }
    return bPoint;
  }
  if (!pointAgreesWithSegment(aPoint.x, aPoint.y, ax0, ay0, ax1, ay1, tA, epsilon, false)) return undefined;
  if (!pointAgreesWithSegment(aPoint.x, aPoint.y, bx0, by0, bx1, by1, tB, epsilon, tA !== 0 && tA !== 1)) {
    return undefined;
  }
  return aPoint;
}

interface CollinearCandidate {
  x: number;
  y: number;
  tA: number;
  tB: number;
}

function collinearOverlapCandidates(
  ax0: number,
  ay0: number,
  ax1: number,
  ay1: number,
  bx0: number,
  by0: number,
  bx1: number,
  by1: number,
  epsilon: number
): CollinearCandidate[] {
  const candidates: CollinearCandidate[] = [];
  const context: CollinearCandidateContext = { ax0, ay0, ax1, ay1, bx0, by0, bx1, by1, epsilon };
  addCandidate(candidates, ax0, ay0, 0, parameterOnSegmentPoint(ax0, ay0, bx0, by0, bx1, by1), context);
  addCandidate(candidates, ax1, ay1, 1, parameterOnSegmentPoint(ax1, ay1, bx0, by0, bx1, by1), context);
  addCandidate(candidates, bx0, by0, parameterOnSegmentPoint(bx0, by0, ax0, ay0, ax1, ay1), 0, context);
  addCandidate(candidates, bx1, by1, parameterOnSegmentPoint(bx1, by1, ax0, ay0, ax1, ay1), 1, context);
  const axis = collinearSortAxis(ax0, ay0, ax1, ay1);
  candidates.sort((left, right) => axis.key(left.x, left.y) - axis.key(right.x, right.y));
  return candidates;
}

interface CollinearMappedInterval {
  startTA: number;
  endTA: number;
  startTB: number;
  endTB: number;
}

function collinearMappedInterval(
  ax0: number,
  ay0: number,
  ax1: number,
  ay1: number,
  bx0: number,
  by0: number,
  bx1: number,
  by1: number,
  tBo: number
): CollinearMappedInterval | null | undefined {
  // 반환 의미: interval object = A 축에서 겹치는 구간, null = 계산됐지만 겹치지 않음,
  // undefined = overflow 등으로 계산 불가(caller가 endpoint 후보 경로로 fallback).
  const bEndT = parameterOnSegmentPoint(bx1, by1, ax0, ay0, ax1, ay1);
  if (!allFinite(bEndT)) return undefined;

  const s = bEndT - tBo;
  if (!allFinite(s) || s === 0) return undefined;

  const bLoOnA = Math.min(tBo, bEndT);
  const bHiOnA = Math.max(tBo, bEndT);
  const startTA = Math.max(0, bLoOnA);
  const endTA = Math.min(1, bHiOnA);
  if (startTA > endTA) return null;

  const startTB = (startTA - tBo) / s;
  const endTB = (endTA - tBo) / s;
  if (!allFinite(startTB, endTB)) return undefined;

  return { startTA, endTA, startTB, endTB };
}

function collinearOverlapFromMappedInterval(
  ax0: number,
  ay0: number,
  ax1: number,
  ay1: number,
  bx0: number,
  by0: number,
  bx1: number,
  by1: number,
  interval: CollinearMappedInterval,
  epsilon: number
): SegmentSegmentDetail {
  const start = {
    x: interpolateCoord(ax0, ax1, interval.startTA),
    y: interpolateCoord(ay0, ay1, interval.startTA),
    tA: clamp01(interval.startTA),
    tB: clamp01(interval.startTB),
  };
  const end = {
    x: interpolateCoord(ax0, ax1, interval.endTA),
    y: interpolateCoord(ay0, ay1, interval.endTA),
    tA: clamp01(interval.endTA),
    tB: clamp01(interval.endTB),
  };
  if (!allFinite(start.x, start.y, end.x, end.y)) return none();

  const overlapDistance = pointPointDist(start.x, start.y, end.x, end.y);
  if (overlapDistance <= epsilon) {
    if (!pointAgreesWithSegment(start.x, start.y, ax0, ay0, ax1, ay1, start.tA, epsilon)) return none();
    if (!pointAgreesWithSegment(start.x, start.y, bx0, by0, bx1, by1, start.tB, epsilon)) return none();
    return { kind: 'point', point: { x: start.x, y: start.y }, tA: start.tA, tB: start.tB };
  }
  const bStart = { x: interpolateCoord(bx0, bx1, start.tB), y: interpolateCoord(by0, by1, start.tB) };
  const bEnd = { x: interpolateCoord(bx0, bx1, end.tB), y: interpolateCoord(by0, by1, end.tB) };
  if (!allFinite(bStart.x, bStart.y, bEnd.x, bEnd.y)) return none();
  if (pointPointDist(bStart.x, bStart.y, bEnd.x, bEnd.y) <= epsilon) return none();

  return {
    kind: 'overlap',
    start: { x: start.x, y: start.y },
    end: { x: end.x, y: end.y },
    tA: [start.tA, end.tA],
    tB: [start.tB, end.tB],
  };
}

interface CollinearCandidateContext {
  ax0: number;
  ay0: number;
  ax1: number;
  ay1: number;
  bx0: number;
  by0: number;
  bx1: number;
  by1: number;
  epsilon: number;
}

function addCandidate(
  candidates: CollinearCandidate[],
  x: number,
  y: number,
  tA: number,
  tB: number,
  context: CollinearCandidateContext
): void {
  if (!allFinite(x, y, tA, tB)) return;
  if (tA < 0 || tA > 1 || tB < 0 || tB > 1) return;
  const { ax0, ay0, ax1, ay1, bx0, by0, bx1, by1, epsilon } = context;
  if (!pointAgreesWithSegment(x, y, ax0, ay0, ax1, ay1, tA, epsilon)) return;
  if (!pointAgreesWithSegment(x, y, bx0, by0, bx1, by1, tB, epsilon)) return;
  if (candidates.some((candidate) => pointPointDist(candidate.x, candidate.y, x, y) <= epsilon)) return;
  // tA/tB는 위 range gate로 이미 [0, 1]이다. clamp가 아니라 -0 부호만 정규화한다.
  candidates.push({ x, y, tA: normalizeZero(tA), tB: normalizeZero(tB) });
}

function collinearSortAxis(
  ax0: number,
  ay0: number,
  ax1: number,
  ay1: number
): { key: (x: number, y: number) => number } {
  const scale = Math.max(Math.abs(ax0), Math.abs(ay0), Math.abs(ax1), Math.abs(ay1));
  if (!Number.isFinite(scale) || scale === 0) return { key: (x) => x };
  const dx = ax1 / scale - ax0 / scale;
  const dy = ay1 / scale - ay0 / scale;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const sign = Math.sign(dx) || 1;
    return { key: (x) => sign * x };
  }
  const sign = Math.sign(dy) || 1;
  return { key: (_x, y) => sign * y };
}

function intersectionParameters(
  qx: number,
  qy: number,
  adx: number,
  ady: number,
  bdx: number,
  bdy: number
): { tA: number; tB: number } | undefined {
  const qScale = Math.max(Math.abs(qx), Math.abs(qy));
  const aScale = Math.max(Math.abs(adx), Math.abs(ady));
  const bScale = Math.max(Math.abs(bdx), Math.abs(bdy));
  if (!allFinite(qScale, aScale, bScale) || aScale === 0 || bScale === 0) return undefined;
  const sadx = adx / aScale;
  const sady = ady / aScale;
  const sbdx = bdx / bScale;
  const sbdy = bdy / bScale;
  const scaledCross = cross2(sadx, sady, sbdx, sbdy);
  if (!Number.isFinite(scaledCross) || scaledCross === 0) return undefined;
  if (qScale === 0) return { tA: 0, tB: 0 };
  const sqx = qx / qScale;
  const sqy = qy / qScale;
  const tA = (qScale / aScale) * (cross2(sqx, sqy, sbdx, sbdy) / scaledCross);
  const tB = (qScale / bScale) * (cross2(sqx, sqy, sadx, sady) / scaledCross);
  if (!allFinite(tA, tB)) return undefined;
  return { tA, tB };
}

function intersectionParametersFromEndpoints(
  ax0: number,
  ay0: number,
  ax1: number,
  ay1: number,
  bx0: number,
  by0: number,
  bx1: number,
  by1: number
): { tA: number; tB: number } | undefined {
  const scale = Math.max(
    Math.abs(ax0),
    Math.abs(ay0),
    Math.abs(ax1),
    Math.abs(ay1),
    Math.abs(bx0),
    Math.abs(by0),
    Math.abs(bx1),
    Math.abs(by1)
  );
  if (!Number.isFinite(scale) || scale === 0) return undefined;
  const nax0 = ax0 / scale;
  const nay0 = ay0 / scale;
  const nadx = ax1 / scale - nax0;
  const nady = ay1 / scale - nay0;
  const nbdx = bx1 / scale - bx0 / scale;
  const nbdy = by1 / scale - by0 / scale;
  const nqx = bx0 / scale - nax0;
  const nqy = by0 / scale - nay0;
  const scaledCross = cross2(nadx, nady, nbdx, nbdy);
  if (scaledCross === 0) return undefined;
  const tA = cross2(nqx, nqy, nbdx, nbdy) / scaledCross;
  const tB = cross2(nqx, nqy, nadx, nady) / scaledCross;
  if (!allFinite(tA, tB)) return undefined;
  return { tA, tB };
}

/**
 * boolean `intersectsSegmentSegment`와 토큰 단위로 동일한 raw range parameter를 계산한다.
 * non-parallel 단일 교점 판정과 collinearByDistance 가로채기 gate가 같은 식을 공유해 parity drift를 막는다.
 */
function rawCrossParams(
  qx: number,
  qy: number,
  adx: number,
  ady: number,
  bdx: number,
  bdy: number,
  cross: number
): { tA: number; tB: number } {
  return { tA: (qx * bdy - qy * bdx) / cross, tB: (qx * ady - qy * adx) / cross };
}
