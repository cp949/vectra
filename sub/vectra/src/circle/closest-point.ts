import type { Circle, Point, PointWritable } from '../types/flat-shapes.internal';
import { closestPointInto } from './closest-point-into';

/**
 * circle 표면에서 point에 가장 가까운 점을 새 object로 반환한다.
 *
 * empty circle은 center 좌표를 반환한다. point가 center와 같으면 angle 0 위치인
 * (cx + r, cy)를 반환한다.
 *
 * @param circle closest point를 계산할 circle
 * @param point circle 표면에 투영할 point
 */
export function closestPoint(circle: Circle, point: Point): PointWritable {
  return closestPointInto({ x: 0, y: 0 }, circle, point);
}
