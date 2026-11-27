import type { Bounds, Point, PointWritable } from '../types/flat-shapes.internal';
import { clampCoordinate } from './closest-point.internal';
import { isEmpty } from './is-empty';

/**
 * bounds 내부 또는 경계에서 point와 가장 가까운 점을 out에 기록한다.
 *
 * empty bounds이면 false를 반환하고 out을 수정하지 않는다.
 * non-empty bounds이면 point를 closed AABB에 clamp한 좌표를 out에 기록하고 true를 반환한다.
 * 내부 또는 boundary point는 input point 좌표를 그대로 기록한다.
 *
 * out이 bounds 또는 point와 같은 객체여도 안전하다.
 * non-finite 좌표는 검증하지 않는다. NaN 입력은 NaN으로 전파된다.
 *
 * @param out 가장 가까운 점을 기록할 점 객체
 * @param bounds closest point를 탐색할 AABB
 * @param point closest point를 탐색할 기준 좌표
 */
export function closestPointInto(out: PointWritable, bounds: Bounds, point: Point): boolean {
  if (isEmpty(bounds)) return false;
  const cx = clampCoordinate(point.x, bounds.minX, bounds.maxX);
  const cy = clampCoordinate(point.y, bounds.minY, bounds.maxY);
  out.x = cx;
  out.y = cy;
  return true;
}
