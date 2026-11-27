import type { Point } from '../types/flat-shapes.internal';

/**
 * 두 점 a, b 사이의 Manhattan 거리(|ax - bx| + |ay - by|)를 반환한다.
 *
 * @param a 거리를 측정할 첫 번째 점
 * @param b 거리를 측정할 두 번째 점
 */
export function manhattanDistance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
