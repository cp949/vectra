import type { Point } from '../types/flat-shapes.internal';

/**
 * a와 b의 dot product를 반환한다.
 *
 * @param a dot product의 첫 번째 벡터
 * @param b dot product의 두 번째 벡터
 */
export function dot(a: Point, b: Point): number {
  return a.x * b.x + a.y * b.y;
}
