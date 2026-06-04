import { createSegment } from '../segment/create-segment';
import type { SegmentWritable, TriangleLike } from '../types';
import { sideAtInto } from './side-at-into';

/**
 * sideAtInto의 allocating companion.
 * index에 해당하는 opposite side를 SegmentWritable로 반환한다. invalid index는 undefined.
 *
 * finite/non-finite 입력과 결과 처리 정책은 `sideAtInto`와 동일하다.
 * degenerate/empty 입력 처리 정책은 `sideAtInto`와 동일하다.
 */
export function sideAt(triangle: TriangleLike, index: number): SegmentWritable | undefined {
  const seed = createSegment();
  if (!sideAtInto(seed, triangle, index)) return undefined;
  return seed;
}
