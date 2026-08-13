import type { XYInput, XYWritable } from '../types';
import { pointDist } from './polyline-distance-primitive.internal';
import { readX, readY, writeXY } from './xy';

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
