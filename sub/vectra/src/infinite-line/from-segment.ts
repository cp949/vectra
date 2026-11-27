import type { InfiniteLineWritable, Segment } from '../types/flat-shapes.internal';
import { createInfiniteLine } from './create-infinite-line';
import { fromSegmentInto } from './from-segment-into';

/**
 * 선분을 `(ox, oy) = (x1, y1)`, `(dx, dy) = (x2 - x1, y2 - y1)`로 가진 새 plain object를 반환한다.
 *
 * finite/non-finite 입력과 결과 처리 정책은 `fromSegmentInto`와 동일하다.
 * degenerate/empty 입력 처리 정책은 `fromSegmentInto`와 동일하다.
 */
export function fromSegment(line: Segment): InfiniteLineWritable {
  return fromSegmentInto(createInfiniteLine(), line);
}
