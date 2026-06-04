import type { SegmentSegmentDetail } from '../types';

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

  const aDegen = ax0 === ax1 && ay0 === ay1;
  const bDegen = bx0 === bx1 && by0 === by1;

  // degenerate 분기: 한 쪽 이상이 점으로 환원된다
  if (aDegen || bDegen) {
    if (aDegen && bDegen) {
      if (pointPointDist(ax0, ay0, bx0, by0) <= epsilon) {
        return { kind: 'point', point: { x: ax0, y: ay0 }, tA: 0, tB: 0 };
      }
      return none();
    }
    if (aDegen) {
      // a를 점으로 보고 b 위 포함 여부를 판정한다
      const t = parameterOnSegmentPoint(ax0, ay0, bx0, by0, bx1, by1);
      const dist = pointLineDist(ax0, ay0, bx0, by0, bx1, by1);
      if (dist <= epsilon && t >= 0 && t <= 1 && pointAgreesWithSegment(ax0, ay0, bx0, by0, bx1, by1, t, epsilon)) {
        return { kind: 'point', point: { x: ax0, y: ay0 }, tA: 0, tB: t };
      }
      return none();
    }
    // b를 점으로 보고 a 위 포함 여부를 판정한다
    const t = parameterOnSegmentPoint(bx0, by0, ax0, ay0, ax1, ay1);
    const dist = pointLineDist(bx0, by0, ax0, ay0, ax1, ay1);
    if (dist <= epsilon && t >= 0 && t <= 1 && pointAgreesWithSegment(bx0, by0, ax0, ay0, ax1, ay1, t, epsilon)) {
      return { kind: 'point', point: { x: bx0, y: by0 }, tA: t, tB: 0 };
    }
    return none();
  }

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

function allFinite(...values: readonly number[]): boolean {
  return values.every(Number.isFinite);
}

function pointPointDist(ax: number, ay: number, bx: number, by: number): number {
  // 직접 차분은 같은 크기 좌표에서 exact(Sterbenz)라 epsilon 경계에서 boolean과 같은 거리다.
  // 차분/거리가 overflow로 non-finite가 될 때만 scale 정규화 fallback을 쓴다.
  const direct = Math.hypot(ax - bx, ay - by);
  if (Number.isFinite(direct)) return direct;
  const scale = Math.max(Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by));
  if (!Number.isFinite(scale)) return Number.POSITIVE_INFINITY;
  if (scale === 0) return 0;
  return scale * Math.hypot(ax / scale - bx / scale, ay / scale - by / scale);
}

function pointLineDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const qx = px - ax;
  const qy = py - ay;
  const dx = bx - ax;
  const dy = by - ay;
  if (allFinite(qx, qy, dx, dy)) {
    const scale = Math.max(Math.abs(qx), Math.abs(qy), Math.abs(dx), Math.abs(dy));
    if (scale === 0) return 0;
    const nqx = qx / scale;
    const nqy = qy / scale;
    const ndx = dx / scale;
    const ndy = dy / scale;
    const len = Math.hypot(ndx, ndy);
    if (len === 0) return pointPointDist(px, py, ax, ay);
    const scaledDist = (scale * Math.abs(cross2(nqx, nqy, ndx, ndy))) / len;
    const axisDist = axisProjectedLineDist(qx, qy, dx, dy);
    return axisDist === undefined ? scaledDist : Math.max(scaledDist, axisDist);
  }

  const scale = Math.max(Math.abs(px), Math.abs(py), Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by));
  if (!Number.isFinite(scale)) return Number.POSITIVE_INFINITY;
  if (scale === 0) return 0;
  const npx = px / scale;
  const npy = py / scale;
  const nax = ax / scale;
  const nay = ay / scale;
  const nbx = bx / scale;
  const nby = by / scale;
  const ndx = nbx - nax;
  const ndy = nby - nay;
  const len = Math.hypot(ndx, ndy);
  if (len === 0) return pointPointDist(px, py, ax, ay);
  const scaledDist = (scale * Math.abs(cross2(npx - nax, npy - nay, ndx, ndy))) / len;
  const axisDist = axisProjectedLineDist(npx - nax, npy - nay, ndx, ndy);
  return axisDist === undefined ? scaledDist : Math.max(scaledDist, scale * axisDist);
}

function axisProjectedLineDist(qx: number, qy: number, dx: number, dy: number): number | undefined {
  const len = Math.hypot(dx, dy);
  if (!Number.isFinite(len) || len === 0) return undefined;
  // len !== 0이므로 dominant 축 성분은 0이 아니다(반대였다면 len === 0).
  if (Math.abs(dx) >= Math.abs(dy)) {
    const t = qx / dx;
    const residual = qy - t * dy;
    const dist = Math.abs(residual) * (Math.abs(dx) / len);
    return Number.isFinite(dist) ? dist : undefined;
  }
  const t = qy / dy;
  const residual = qx - t * dx;
  const dist = Math.abs(residual) * (Math.abs(dy) / len);
  return Number.isFinite(dist) ? dist : undefined;
}

function segmentEndpointsCollinearWithinDistance(
  ax0: number,
  ay0: number,
  ax1: number,
  ay1: number,
  bx0: number,
  by0: number,
  bx1: number,
  by1: number,
  epsilon: number
): boolean {
  const startDist = pointLineDist(bx0, by0, ax0, ay0, ax1, ay1);
  const endDist = pointLineDist(bx1, by1, ax0, ay0, ax1, ay1);
  return Number.isFinite(startDist) && Number.isFinite(endDist) && startDist <= epsilon && endDist <= epsilon;
}

function parameterOnSegmentPoint(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const qx = px - ax;
  const qy = py - ay;
  const dx = bx - ax;
  const dy = by - ay;
  if (allFinite(qx, qy, dx, dy) && (dx !== 0 || dy !== 0)) {
    if (Math.abs(dx) >= Math.abs(dy)) return qx / dx;
    return qy / dy;
  }

  const scale = Math.max(Math.abs(px), Math.abs(py), Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by));
  if (!Number.isFinite(scale) || scale === 0) return Number.NaN;
  const npx = px / scale;
  const npy = py / scale;
  const nax = ax / scale;
  const nay = ay / scale;
  const nbx = bx / scale;
  const nby = by / scale;
  const ndx = nbx - nax;
  const ndy = nby - nay;
  if (Math.abs(ndx) >= Math.abs(ndy)) return (npx - nax) / ndx;
  return (npy - nay) / ndy;
}

function interpolateCoord(start: number, end: number, t: number): number {
  if (Number.isFinite(end - start)) return start + t * (end - start);
  const scale = Math.max(Math.abs(start), Math.abs(end));
  if (!Number.isFinite(scale) || scale === 0) return Number.NaN;
  return scale * (start / scale + t * (end / scale - start / scale));
}

function interpolationScale(ax: number, ay: number, bx: number, by: number): number {
  return Math.max(Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by));
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

function agreesWithEndpointParameter(
  x: number,
  y: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  t: number,
  epsilon: number,
  allowRoundedEndpoint: boolean
): boolean {
  if (t !== 0 && t !== 1) return true;
  const endpointDist = t === 0 ? pointPointDist(x, y, ax, ay) : pointPointDist(x, y, bx, by);
  if (endpointDist <= epsilon) return true;
  if (!allowRoundedEndpoint) return false;
  const projectedT = parameterOnSegmentPoint(x, y, ax, ay, bx, by);
  return allFinite(projectedT) && projectedT >= 0 && projectedT <= 1;
}

function pointAgreesWithSegment(
  x: number,
  y: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  t: number,
  epsilon: number,
  allowRoundedEndpoint = false
): boolean {
  return (
    agreesWithEndpointParameter(x, y, ax, ay, bx, by, t, epsilon, allowRoundedEndpoint) &&
    pointLineDist(x, y, ax, ay, bx, by) <= epsilon
  );
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

function cross2(ax: number, ay: number, bx: number, by: number): number {
  return ax * by - ay * bx;
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

/** t를 [0, 1]로 clamp한다. */
function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

/** -0을 +0으로 정규화한다. parameter 출력 부호를 일관되게 유지한다. */
function normalizeZero(t: number): number {
  return t === 0 ? 0 : t;
}
