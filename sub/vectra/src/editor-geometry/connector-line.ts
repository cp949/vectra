import { createSegment } from '../segment/create-segment';
import type { BoundsLike, SegmentWritable } from '../types';
import { connectorLineInto } from './connector-line-into';

/**
 * 두 bounds의 center를 잇는 segment를 plain SegmentLike object로 반환한다.
 *
 * bounds center는 각 bounds의 min/max 중점이다.
 * NaN/Infinity 입력은 silent propagation. throw 없음.
 */
export function connectorLine(from: BoundsLike, to: BoundsLike): SegmentWritable {
  return connectorLineInto(createSegment(), from, to);
}
