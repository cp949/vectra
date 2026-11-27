import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * a에서 b를 뺀 벡터를 새 object로 반환한다.
 *
 * @param a 피감산 벡터
 * @param b 감산 벡터
 */
export function sub(a: Point, b: Point): PointWritable {
  return { x: a.x - b.x, y: a.y - b.y };
}
