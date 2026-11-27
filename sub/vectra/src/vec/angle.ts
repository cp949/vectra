import type { Point } from '../types/flat-shapes.internal';

/**
 * 벡터의 방향각을 radian으로 반환한다. 범위는 (-π, π]이다.
 *
 * zero vector는 0을 반환한다.
 *
 * @param input 방향각을 측정할 벡터
 */
export function angle(input: Point): number {
  return Math.atan2(input.y, input.x);
}
