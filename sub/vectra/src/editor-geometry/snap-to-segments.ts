import { readSegmentA, readSegmentB } from '../internal/segment';
import { distanceSqXY, readX, readY } from '../internal/xy';
import { closestPointOnSegment } from '../segment/closest-point.internal';
import type { SegmentLike, XYInput } from '../types';
import type { SnapResult } from './types';

/**
 * point에서 가장 가까운 segment 위 점으로 snap한다.
 *
 * tolerance 이내 segment가 없으면 snapped: false를 반환한다. 동거리이면 insertion order 우선이다.
 *
 * @param point 기준 point
 * @param segments snap 후보 segment 배열
 * @param tolerance world 좌표 단위 최대 허용 거리
 */
export function snapPointToSegments(point: XYInput, segments: SegmentLike[], tolerance: number): SnapResult {
  const px = readX(point);
  const py = readY(point);
  // tolerance가 양의 유한수가 아니면(0, 음수, NaN) 모두 miss. 음수가 제곱돼 false-hit가 되는 것을 막는다.
  if (!(tolerance > 0)) {
    return { snapped: false, x: px, y: py, distance: Infinity, source: 'none' };
  }
  // squared 거리로 비교하고 winner에만 sqrt를 적용해 후보당 sqrt 호출을 한 번으로 줄인다.
  const tolSq = tolerance * tolerance;
  let bestDistSq = tolSq;
  let bestX = px;
  let bestY = py;
  let found = false;

  for (const seg of segments) {
    const a = readSegmentA(seg);
    const b = readSegmentB(seg);
    const cp = closestPointOnSegment(readX(a), readY(a), readX(b), readY(b), px, py);
    const distSq = distanceSqXY(cp.x, cp.y, px, py);
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      bestX = cp.x;
      bestY = cp.y;
      found = true;
    }
  }

  if (!found) return { snapped: false, x: px, y: py, distance: Infinity, source: 'none' };
  return { snapped: true, x: bestX, y: bestY, distance: Math.sqrt(bestDistSq), source: 'segment' };
}
