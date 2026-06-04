import type { InfiniteLineLike, RectLike, SegmentWritable } from '../types';
import { segmentInsideRectInto } from './segment-inside-rect-into';

/**
 * infinite-line이 axis-aligned rect 내부를 지나는 새 clipped segment를 반환한다. no-hit이면 undefined를 반환한다.
 *
 * 대응 `segmentInsideRectInto`와 정책이 같다. infinite-line range와 rect 내부 구간의 교집합을
 * bounded segment로 반환한다. endpoint 순서는 source direction의 increasing `t`다.
 * 실패 조건: zero-direction infinite-line, empty rect, rect와 만나지 않음, clip 길이 0,
 * non-finite 좌표.
 *
 * @param line clipped segment를 구할 infinite-line
 * @param rect 경계 rect (axis-aligned)
 */
export function segmentInsideRect(line: InfiniteLineLike, rect: RectLike): SegmentWritable | undefined {
  const seed: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
  if (!segmentInsideRectInto(seed, line, rect)) return undefined;
  return seed;
}
