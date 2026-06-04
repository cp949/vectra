import type { SegmentLike, XYObjectWritable } from '../types';
import { normalInto } from './normal-into';

/**
 * segment의 단위 법선벡터를 새 object로 반환한다. zero-length에서는 (0, 0)을 반환한다.
 *
 * @param line 법선벡터를 계산할 segment
 * @param side 'left'(기본값, CCW: -dy,dx 정규화) 또는 'right'(CW: dy,-dx 정규화)
 */
export function normal(line: SegmentLike, side: 'left' | 'right' = 'left'): XYObjectWritable {
  return normalInto({ x: 0, y: 0 }, line, side);
}
