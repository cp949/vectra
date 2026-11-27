import type { Point } from '../types/flat-shapes.internal';

/**
 * a와 b의 각 성분이 `===`로 같으면 true를 반환한다.
 *
 * @param a 비교할 첫 번째 벡터
 * @param b 비교할 두 번째 벡터
 */
export function equals(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}
