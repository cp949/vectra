import type { InfiniteLineWritable, SegmentLike } from '../types';
import { createInfiniteLine } from './create-infinite-line';
import { fromSegmentInto } from './from-segment-into';

/**
 * segment `a -> b`를 `origin = a`, `direction = b - a`로 가진 새 plain object를 반환한다.
 *
 * finite/non-finite 입력과 결과 처리 정책은 `fromSegmentInto`와 동일하다.
 * degenerate/empty 입력 처리 정책은 `fromSegmentInto`와 동일하다.
 */
export function fromSegment(line: SegmentLike): InfiniteLineWritable {
  return fromSegmentInto(createInfiniteLine(), line);
}
