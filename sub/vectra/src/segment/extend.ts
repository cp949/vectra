import { createZeroSegment } from '../internal/segment';
import type { Segment, SegmentWritable } from '../types/flat-shapes.internal';
import { extendInto } from './extend-into';

/**
 * segment를 before/after만큼 연장한 새 plain object를 반환한다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `extendInto`와 동일하다.
 * clamp/정규화/fallback 정책은 `extendInto`와 동일하다.
 * @param line 연장할 segment
 * @param before 시작점을 뒤로 이동할 거리
 * @param after 끝점을 앞으로 이동할 거리
 */
export function extend(line: Segment, before: number, after: number): SegmentWritable {
  return extendInto(createZeroSegment(), line, before, after);
}
