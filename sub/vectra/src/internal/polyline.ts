import type { PolylineLike, XYInput, XYWritable } from '../types';
import { readX, readY, writeXY } from './xy';

function isPolylinePointArray(polyline: PolylineLike): polyline is readonly XYInput[] {
  return Array.isArray(polyline);
}

/**
 * 두 좌표 사이 유클리드 거리를 반환한다.
 *
 * internal 전용 helper이며 finite 검증 없이 Math.hypot을 그대로 사용한다.
 *
 * @param ax 시작 x 좌표
 * @param ay 시작 y 좌표
 * @param bx 끝 x 좌표
 * @param by 끝 y 좌표
 */
export function pointDist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(bx - ax, by - ay);
}

/**
 * PolylineLike에서 ordered point array를 읽는다.
 *
 * array 자체를 넘긴 input은 그대로 사용하고, canonical object shape는 points field를 사용한다.
 *
 * @param polyline point array로 해석할 polyline input
 */
export function readPolylinePoints(polyline: PolylineLike): readonly XYInput[] {
  if (isPolylinePointArray(polyline)) return polyline;
  return polyline.points;
}

/**
 * point (qx, qy)와 segment (ax,ay)→(bx,by) 사이 최단 거리 제곱을 반환한다.
 *
 * zero-length segment는 point와 a 사이 거리 제곱을 반환한다.
 *
 * @param ax segment 시작 x 좌표
 * @param ay segment 시작 y 좌표
 * @param bx segment 끝 x 좌표
 * @param by segment 끝 y 좌표
 * @param qx 거리 측정 대상 point의 x 좌표
 * @param qy 거리 측정 대상 point의 y 좌표
 */
export function segDistSq(ax: number, ay: number, bx: number, by: number, qx: number, qy: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  const px = qx - ax;
  const py = qy - ay;
  if (lenSq === 0) return px * px + py * py;
  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / lenSq));
  const cx = t * dx - px;
  const cy = t * dy - py;
  return cx * cx + cy * cy;
}

/**
 * point (qx, qy)의 segment (ax,ay)→(bx,by) 위 clamped projection parameter t를 반환한다.
 *
 * t는 [0, 1]로 clamp되며, zero-length segment는 0을 반환한다.
 * 사용처가 이 t로 closest 좌표(ax + t*dx, ay + t*dy)와 거리 제곱을 한 번에 계산할 수 있다.
 *
 * @param ax segment 시작 x 좌표
 * @param ay segment 시작 y 좌표
 * @param bx segment 끝 x 좌표
 * @param by segment 끝 y 좌표
 * @param qx projection 대상 point의 x 좌표
 * @param qy projection 대상 point의 y 좌표
 */
export function segClampedT(ax: number, ay: number, bx: number, by: number, qx: number, qy: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return 0;
  return Math.max(0, Math.min(1, ((qx - ax) * dx + (qy - ay) * dy) / lenSq));
}

/**
 * polyline points의 모든 인접 segment 길이 합을 반환한다.
 *
 * empty points와 single-point points는 0을 반환한다.
 *
 * @param points 길이를 합산할 polyline vertex 목록
 */
export function polylineTotalLength(points: readonly XYInput[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += pointDist(readX(points[i - 1]), readY(points[i - 1]), readX(points[i]), readY(points[i]));
  }
  return total;
}

/**
 * polyline의 index번째 vertex에서 tangent를 계산해 out에 기록하고 true를 반환한다.
 *
 * tangent는 인접 edge 방향의 정규화된 평균이다. 끝점은 단일 edge 방향을 사용한다.
 * zero-length adjacent edge는 무시하고 유효한 edge 방향만 평균한다. 유효한 인접 edge가
 * 없으면 out을 수정하지 않고 false를 반환한다.
 *
 * 호출자는 index가 [0, points.length) 범위의 정수임을 보장해야 한다.
 * empty / single-point points는 항상 false를 반환한다.
 *
 * @param out tangent를 기록할 writable output
 * @param points tangent를 계산할 polyline vertex 목록
 * @param index vertex index (0-based integer)
 */
export function polylineVertexTangentInto(out: XYWritable, points: readonly XYInput[], index: number): boolean {
  const n = points.length;
  if (n < 2) return false;

  let tx = 0;
  let ty = 0;

  // 이전 segment (index > 0 이면 존재)
  if (index > 0) {
    const ax = readX(points[index - 1]);
    const ay = readY(points[index - 1]);
    const bx = readX(points[index]);
    const by = readY(points[index]);
    const len = pointDist(ax, ay, bx, by);
    if (len > 0) {
      tx += (bx - ax) / len;
      ty += (by - ay) / len;
    }
  }

  // 다음 segment (index < n-1 이면 존재)
  if (index < n - 1) {
    const ax = readX(points[index]);
    const ay = readY(points[index]);
    const bx = readX(points[index + 1]);
    const by = readY(points[index + 1]);
    const len = pointDist(ax, ay, bx, by);
    if (len > 0) {
      tx += (bx - ax) / len;
      ty += (by - ay) / len;
    }
  }

  // 유효한 인접 edge가 없으면 실패
  const mag = Math.hypot(tx, ty);
  if (mag === 0) return false;

  writeXY(out, tx / mag, ty / mag);
  return true;
}

/**
 * polyline의 arclength offset 위치가 속한 non-zero segment의 단위 tangent를 out에 기록한다.
 *
 * tangent는 target 위치를 포함하는 non-zero segment의 진행 방향 단위 벡터다. `length`는
 * `[0, totalLength]`로 clamp된다. target이 segment boundary에 정확히 걸리면 앞쪽(먼저 끝나는)
 * non-zero segment 방향을 사용한다. `length`가 0 이하이면 첫 non-zero segment, `totalLength`
 * 이상이면 마지막 non-zero segment 방향이다. zero-length segment는 tangent 후보에서 제외한다.
 * `length` 또는 total length 계산이 NaN이면 NaN tangent를 기록한다.
 *
 * empty / single-point points, total length가 0인 repeated-point points는 false를 반환하고
 * out을 수정하지 않는다. out이 points와 alias되어도 안전하다. segment 좌표를 local로 먼저 읽은
 * 뒤 out에 기록한다. finite 좌표 validation은 수행하지 않는다.
 *
 * @param out 단위 tangent를 기록할 writable output
 * @param points tangent를 계산할 polyline vertex 목록
 * @param length polyline 시작점부터의 arclength offset
 */
export function polylineSegmentTangentAtLengthInto(
  out: XYWritable,
  points: readonly XYInput[],
  length: number
): boolean {
  const n = points.length;
  if (n < 2) return false;

  const totalLen = polylineTotalLength(points);
  if (totalLen === 0) return false;

  const target = Math.max(0, Math.min(length, totalLen));
  if (Number.isNaN(target)) {
    writeXY(out, Number.NaN, Number.NaN);
    return true;
  }

  let acc = 0;
  let firstDx = 0;
  let firstDy = 0;
  let firstLen = 0;

  for (let i = 1; i < n; i++) {
    const ax = readX(points[i - 1]);
    const ay = readY(points[i - 1]);
    const bx = readX(points[i]);
    const by = readY(points[i]);
    const dx = bx - ax;
    const dy = by - ay;
    const segLen = Math.hypot(dx, dy);

    if (segLen === 0) continue;

    if (firstLen === 0) {
      firstDx = dx;
      firstDy = dy;
      firstLen = segLen;
    }

    // target이 이 segment 구간 (acc, acc+segLen]에 속하면 이 segment 방향을 사용한다.
    // boundary(target === acc+segLen)는 앞쪽 non-zero segment가 선택된다.
    if (target > acc && target <= acc + segLen) {
      writeXY(out, dx / segLen, dy / segLen);
      return true;
    }

    acc += segLen;
  }

  // 루프가 owner를 못 찾는 경우는 target === 0뿐이다.
  // 이때 첫 non-zero segment 방향을 사용한다. totalLen > 0이므로 firstLen > 0이 보장된다.
  writeXY(out, firstDx / firstLen, firstDy / firstLen);
  return true;
}

/**
 * polyline의 length offset target에서 보간한 point를 out에 기록한다.
 *
 * 호출자가 points.length >= 2, totalLen > 0, target ∈ [0, totalLen]를 보장한다.
 * 마지막 segment까지 누적 길이가 target에 도달하지 못해도 마지막 segment 위에서 보간한다.
 *
 * @param out 보간한 point를 기록할 writable output
 * @param points sample할 polyline vertex 목록
 * @param target polyline 시작점부터의 length offset
 */
export function polylineSampleAtLengthInto(out: XYWritable, points: readonly XYInput[], target: number): void {
  const n = points.length;
  let acc = 0;
  for (let i = 1; i < n; i++) {
    const ax = readX(points[i - 1]);
    const ay = readY(points[i - 1]);
    const bx = readX(points[i]);
    const by = readY(points[i]);
    const segLen = pointDist(ax, ay, bx, by);
    // 마지막 segment이거나 target에 도달하면 이 segment 위에서 보간
    if (i === n - 1 || acc + segLen >= target) {
      if (segLen === 0) {
        writeXY(out, ax, ay);
      } else {
        const localT = Math.max(0, Math.min(1, (target - acc) / segLen));
        writeXY(out, ax + localT * (bx - ax), ay + localT * (by - ay));
      }
      return;
    }
    acc += segLen;
  }
}
