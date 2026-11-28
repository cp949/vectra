import type { PointWritable, Segment } from '../types/flat-shapes.internal';
import { pointOnSegmentInto } from './point-on-segment-into';
import type { RandomSource } from './random';

/**
 * segment 위의 무작위 점을 새 object로 반환한다.
 *
 * 시작점과 끝점이 같은 segment면 endpoint를 반환한다.
 *
 * @param segment - 대상 segment. 두 endpoint를 읽는다
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export function pointOnSegment(segment: Segment, rng?: RandomSource): PointWritable {
  const out = { x: 0, y: 0 };
  pointOnSegmentInto(out, segment, rng);
  return out;
}
