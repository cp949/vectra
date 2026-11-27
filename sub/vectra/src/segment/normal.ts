import type { Segment, PointWritable } from '../types/flat-shapes.internal';
import { normalInto } from './normal-into';

/**
 * segment의 단위 법선벡터를 새 object로 반환한다. zero-length에서는 (0, 0)을 반환한다.
 *
 * @param line 법선벡터를 계산할 segment
 * @param side 'left'(기본값, CCW: -dy,dx 정규화) 또는 'right'(CW: dy,-dx 정규화)
 */
export function normal(line: Segment, side: 'left' | 'right' = 'left'): PointWritable {
  return normalInto({ x: 0, y: 0 }, line, side);
}
