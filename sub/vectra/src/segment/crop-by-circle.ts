import type { CircleLike, SegmentLike, SegmentWritable } from '../types';
import { cropByCircleInto } from './crop-by-circle-into';

/**
 * segment를 circle boundary로 crop한 새 segment를 반환한다. crop 실패면 undefined를 반환한다.
 *
 * 대응 `cropByCircleInto`와 정책이 같다. segment range `[0, 1]`과 disk 내부 구간의 교집합을
 * bounded segment로 반환한다. endpoint 순서는 원본 `a → b` 진행 방향을 유지한다.
 * 실패 조건: zero-length(degenerate) segment, circle radius가 finite positive 아님, disk와 만나지
 * 않음, tangent(clip 길이 0), non-finite 좌표.
 *
 * @param line crop할 segment
 * @param circle crop 경계 circle
 */
export function cropByCircle(line: SegmentLike, circle: CircleLike): SegmentWritable | undefined {
  const seed: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
  if (!cropByCircleInto(seed, line, circle)) return undefined;
  return seed;
}
