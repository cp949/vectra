import type { Point } from '../types/flat-shapes.internal';

/**
 * vector a를 basis b에 투영한 scalar 값을 반환한다.
 *
 * `dot(a, b) / lengthSq(b)`. b가 zero vector이면 0을 반환한다.
 * non-finite 입력은 검증 없이 pass through한다.
 *
 * @param a 투영할 벡터
 * @param b 투영 기준 벡터 (임의 길이)
 */
export function projectScalar(a: Point, b: Point): number {
  const ax = a.x;
  const ay = a.y;
  const bx = b.x;
  const by = b.y;
  const lsq = bx * bx + by * by;
  if (lsq === 0) return 0;
  return (ax * bx + ay * by) / lsq;
}
