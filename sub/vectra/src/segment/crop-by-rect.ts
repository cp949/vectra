import type { RectLike, SegmentLike, SegmentWritable } from '../types';
import { cropByRectInto } from './crop-by-rect-into';

/**
 * segment를 axis-aligned rect boundary로 crop한 새 segment를 반환한다. crop 실패면 undefined를 반환한다.
 *
 * 대응 `cropByRectInto`와 정책이 같다. segment range `[0, 1]`과 rect 내부 구간의 교집합을
 * bounded segment로 반환한다. endpoint 순서는 원본 `a → b` 진행 방향을 유지한다.
 * 실패 조건: zero-length(degenerate) segment, empty rect, rect와 만나지 않음, clip 길이 0,
 * non-finite 좌표.
 *
 * @param line crop할 segment
 * @param rect crop 경계 rect (axis-aligned)
 */
export function cropByRect(line: SegmentLike, rect: RectLike): SegmentWritable | undefined {
  const seed: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
  if (!cropByRectInto(seed, line, rect)) return undefined;
  return seed;
}
