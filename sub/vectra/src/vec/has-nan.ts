import type { Point } from '../types/flat-shapes.internal';

/**
 * input의 x 또는 y 중 하나라도 NaN이면 true를 반환한다.
 *
 * @param input NaN 성분을 검사할 벡터
 */
export function hasNan(input: Point): boolean {
  return Number.isNaN(input.x) || Number.isNaN(input.y);
}
