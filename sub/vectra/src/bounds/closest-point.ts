import type { Bounds, Point, PointWritable } from '../types/flat-shapes.internal';
import { clampCoordinate } from './closest-point.internal';
import { isEmpty } from './is-empty';

/**
 * bounds 내부 또는 경계에서 point와 가장 가까운 점을 새 plain object로 반환한다.
 *
 * empty bounds이면 undefined를 반환한다.
 * non-empty bounds이면 point를 closed AABB에 clamp한 좌표를 { x, y } object로 반환한다.
 * 내부 또는 boundary point는 input point 좌표를 그대로 반환한다.
 *
 * non-finite 좌표는 검증하지 않는다. NaN 입력은 NaN으로 전파된다.
 *
 * @param bounds closest point를 탐색할 AABB
 * @param point closest point를 탐색할 기준 좌표
 */
export function closestPoint(bounds: Bounds, point: Point): PointWritable | undefined {
  if (isEmpty(bounds)) return undefined;
  const cx = clampCoordinate(point.x, bounds.minX, bounds.maxX);
  const cy = clampCoordinate(point.y, bounds.minY, bounds.maxY);
  return { x: cx, y: cy };
}
