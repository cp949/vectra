import {
  allFinite,
  cross2,
  interpolateCoord,
  interpolationScale,
  pointAgreesWithSegment,
} from './segment-segment-geometry.internal';

export function intersectionPointFromParams(
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

export function intersectionParameters(
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

export function intersectionParametersFromEndpoints(
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
export function rawCrossParams(
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
