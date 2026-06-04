import { createSegment } from '../segment/create-segment';
import type { PolylineLike, SegmentWritable } from '../types';
import { segmentAtInto } from './segment-at-into';

/**
 * segmentAtInto의 allocating companion. invalid index에서는 undefined를 반환한다.
 *
 * degenerate/empty 입력 처리 정책은 `segmentAtInto`와 동일하다.
 */
export function segmentAt(polyline: PolylineLike, index: number): SegmentWritable | undefined {
  const seed = createSegment();
  if (!segmentAtInto(seed, polyline, index)) return undefined;
  return seed;
}
