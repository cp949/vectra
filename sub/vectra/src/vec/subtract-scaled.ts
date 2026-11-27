import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * a에서 b * scalar를 뺀 벡터를 새 object로 반환한다.
 *
 * b를 먼저 scalar로 곱한 뒤 a에서 뺀다.
 *
 * @param a 기준 벡터
 * @param b scalar를 곱한 뒤 뺄 벡터
 * @param scalar b에 곱할 스칼라값
 */
export function subtractScaled(a: Point, b: Point, scalar: number): PointWritable {
  return { x: a.x - b.x * scalar, y: a.y - b.y * scalar };
}
