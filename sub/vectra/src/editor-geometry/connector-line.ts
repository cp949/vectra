import { createZeroSegment } from '../internal/segment';
import type { Bounds, SegmentWritable } from '../types/flat-shapes.internal';
import { connectorLineInto } from './connector-line-into';

/**
 * 두 bounds의 center를 잇는 segment를 plain Segment object로 반환한다.
 *
 * bounds center는 각 bounds의 min/max 중점이다.
 * NaN/Infinity 입력은 silent propagation. throw 없음.
 */
export function connectorLine(from: Bounds, to: Bounds): SegmentWritable {
  return connectorLineInto(createZeroSegment(), from, to);
}
