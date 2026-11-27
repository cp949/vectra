import { DEFAULT_EPSILON, nearEqualNumber } from '../internal/numeric';
import type { Point } from '../types/flat-shapes.internal';

/**
 * a와 b의 각 성분 차이가 epsilon 이하이면 true를 반환한다.
 *
 * epsilon은 절대 오차이며 경계값을 포함한다.
 *
 * @param a 비교할 첫 번째 벡터
 * @param b 비교할 두 번째 벡터
 * @param epsilon 허용할 절대 오차
 */
export function nearEquals(a: Point, b: Point, epsilon = DEFAULT_EPSILON): boolean {
  return nearEqualNumber(a.x, b.x, epsilon) && nearEqualNumber(a.y, b.y, epsilon);
}
