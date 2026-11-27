import type { Point } from '../types/flat-shapes.internal';

/**
 * a와 b의 2D cross product를 z 성분 스칼라로 반환한다.
 *
 * @param a cross product의 첫 번째 벡터
 * @param b cross product의 두 번째 벡터
 */
export function cross(a: Point, b: Point): number {
  return a.x * b.y - a.y * b.x;
}
