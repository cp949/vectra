import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * a와 b를 더한 벡터를 새 object로 반환한다.
 *
 * @param a 더할 첫 번째 벡터
 * @param b 더할 두 번째 벡터
 */
export function add(a: Point, b: Point): PointWritable {
  return { x: a.x + b.x, y: a.y + b.y };
}
