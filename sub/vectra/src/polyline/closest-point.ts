import type { Polyline, Point, PointWritable } from '../types/flat-shapes.internal';
import { closestPointInto } from './closest-point-into';

/**
 * closestPointInto의 allocating companion. empty polyline에서는 undefined를 반환한다.
 *
 * clamp/정규화/fallback 정책은 `closestPointInto`와 동일하다.
 */
export function closestPoint(polyline: Polyline, point: Point): PointWritable | undefined {
  const seed: PointWritable = { x: 0, y: 0 };
  if (!closestPointInto(seed, polyline, point)) return undefined;
  return seed;
}
