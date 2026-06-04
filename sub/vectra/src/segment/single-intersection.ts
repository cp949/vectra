import { DEFAULT_EPSILON } from '../internal/numeric';
import type { SegmentLike, XYObjectWritable } from '../types';
import { singleIntersectionInto } from './single-intersection-into';

/**
 * 두 segment가 단일 교점을 가지면 그 좌표를 새 object로 반환한다. 교점이 없으면 undefined를 반환한다.
 *
 * collinear 분기(|cross(da,db)| <= epsilon)에서는 항상 undefined를 반환한다.
 * 교점 좌표는 line a 기준 a0 + t1*(a1-a0)로 계산한다.
 * endpoint touch는 해당 endpoint 좌표를 그대로 반환한다(t1 우선, 그 다음 t2).
 *
 * @param a 첫 번째 segment
 * @param b 두 번째 segment
 * @param epsilon cross product 절대값 임계값
 */
export function singleIntersection(
  a: SegmentLike,
  b: SegmentLike,
  epsilon: number = DEFAULT_EPSILON
): XYObjectWritable | undefined {
  const seed: XYObjectWritable = { x: 0, y: 0 };
  if (!singleIntersectionInto(seed, a, b, epsilon)) return undefined;
  return seed;
}
