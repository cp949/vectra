import type { CircleLike, SegmentWritable } from '../types';
import { internalTangentsInto } from './internal-tangents-into';

/**
 * 두 원의 internal tangent segment들을 새 배열로 반환한다.
 *
 * 각 segment의 a는 첫 번째 circle 위 tangent point, b는 두 번째 circle 위 tangent point다.
 * 둘 중 하나라도 empty circle(radius <= 0)이면 빈 배열을 반환한다.
 * 중심이 같으면 빈 배열을 반환한다.
 * 두 원이 겹치면 internal tangent가 없으므로 빈 배열을 반환한다.
 * 외접 collapse case에서는 같은 segment를 중복 push하지 않는다.
 * non-finite 좌표와 radius는 caller 책임이다.
 *
 * @param circleA 첫 번째 원
 * @param circleB 두 번째 원
 */
export function internalTangents(circleA: CircleLike, circleB: CircleLike): SegmentWritable[] {
  return internalTangentsInto([], circleA, circleB);
}
