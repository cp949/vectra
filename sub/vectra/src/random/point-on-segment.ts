import type { SegmentLike } from '../types';
import { pointOnSegmentInto } from './point-on-segment-into';
import type { RandomSource } from './random';

/**
 * segment 위의 무작위 점을 새 object로 반환한다.
 *
 * degenerate segment(a === b)인 경우 endpoint를 반환한다.
 *
 * @param segment - 대상 segment. 두 endpoint를 읽는다
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export function pointOnSegment(segment: SegmentLike, rng?: RandomSource): { x: number; y: number } {
  const out = { x: 0, y: 0 };
  pointOnSegmentInto(out, segment, rng);
  return out;
}
