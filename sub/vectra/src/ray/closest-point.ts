import type { Ray, Point, PointWritable } from '../types/flat-shapes.internal';
import { closestPointInto } from './closest-point-into';

/**
 * ray 위에서 `point`와 가장 가까운 점을 새 plain object로 반환한다.
 *
 * `t`를 `[0, Infinity)`로 clamp. `closestPointInto`에 위임하는 companion wrapper다.
 *
 * degenerate/empty 입력 처리 정책은 `closestPointInto`와 동일하다.
 */
export function closestPoint(ray: Ray, point: Point): PointWritable {
  return closestPointInto({ x: 0, y: 0 }, ray, point);
}
