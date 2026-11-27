import { midpoint as midpointImpl } from '../interpolation/midpoint';
import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * a와 b의 중점 벡터를 새 object로 반환한다.
 *
 * `interpolation.midpoint`와 동일한 계산 및 정책을 사용하는 vec 도메인 alias다.
 * a, b의 x/y는 finite number여야 한다.
 *
 * @param a 중점을 구할 첫 번째 벡터
 * @param b 중점을 구할 두 번째 벡터
 */
export function midpoint(a: Point, b: Point): PointWritable {
  return midpointImpl(a, b);
}
