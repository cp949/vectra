import type { BoundsLike, BoundsWritable } from '../types';
import { aggregateBoundsInto } from './bounds-aggregate.internal';

/**
 * bounds 배열의 union AABB를 out에 기록한다.
 *
 * 성공 시 true를 반환하고 out에 결과를 기록한다.
 * 빈 입력(`bounds.length === 0`)이면 false를 반환하고 out을 수정하지 않는다.
 * inverted bounds(min > max)는 그대로 사용한다. caller가 사전 정규화한다고 가정한다.
 * NaN/Infinity 좌표는 silent propagation(IEEE-754 동작).
 *
 * @param out union bounds를 기록할 writable output
 * @param bounds union을 계산할 bounds 입력 배열
 */
export function groupBoundsInto<Out extends BoundsWritable>(out: Out, bounds: readonly BoundsLike[]): boolean {
  return aggregateBoundsInto(out, bounds);
}
