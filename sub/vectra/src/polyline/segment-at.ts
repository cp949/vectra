import { createZeroSegment } from '../internal/segment';
import type { Polyline, SegmentWritable } from '../types/flat-shapes.internal';
import { segmentAtInto } from './segment-at-into';

/**
 * segmentAtInto의 allocating companion. invalid index에서는 undefined를 반환한다.
 *
 * degenerate/empty 입력 처리 정책은 `segmentAtInto`와 동일하다.
 */
export function segmentAt(polyline: Polyline, index: number): SegmentWritable | undefined {
  const seed = createZeroSegment();
  if (!segmentAtInto(seed, polyline, index)) return undefined;
  return seed;
}
