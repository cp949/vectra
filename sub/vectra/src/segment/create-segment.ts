import type { SegmentWritable } from '../types';

/**
 * zero-initialized segment writable을 새로 만든다.
 *
 * 인자를 받지 않는다. `SegmentLike`를 새 plain object로 복사하려면 `segmentFrom`을 사용한다.
 */
export function createSegment(): SegmentWritable {
  return { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
}
