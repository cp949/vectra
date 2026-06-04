import type { SegmentLike, SegmentWritable } from '../types';
import { createSegment } from './create-segment';
import { extendInto } from './extend-into';

/**
 * segment를 before/after만큼 연장한 새 plain object를 반환한다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `extendInto`와 동일하다.
 * clamp/정규화/fallback 정책은 `extendInto`와 동일하다.
 * @param line 연장할 segment
 * @param before a endpoint를 뒤쪽으로 이동할 거리
 * @param after b endpoint를 앞쪽으로 이동할 거리
 */
export function extend(line: SegmentLike, before: number, after: number): SegmentWritable {
  return extendInto(createSegment(), line, before, after);
}
