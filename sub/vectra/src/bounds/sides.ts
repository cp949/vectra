import type { BoundsLike, SegmentWritable, XYObjectWritable } from '../types';
import { sidesInto } from './sides-into';

/**
 * bounds의 4개 변(edge)을 새 배열로 반환한다.
 *
 * top, right, bottom, left 순서로 새 `SegmentWritable` object를 담은 배열을 반환한다.
 * 반환 배열 길이는 항상 4이다.
 *
 * 각 side의 endpoint object는 독립 reference이다. 인접 side가 같은 corner 좌표를
 * 공유하더라도 endpoint object를 공유하지 않으므로 한 endpoint mutation이 다른
 * side에 전파되지 않는다.
 * empty/inverted bounds와 sentinel bounds에서도 raw 좌표로 4개 변을 반환한다.
 * caller가 미리 `isEmpty`로 거른다.
 *
 * @param bounds 변을 읽을 bounds
 */
export function sides(bounds: BoundsLike): SegmentWritable<XYObjectWritable, XYObjectWritable>[] {
  const out: SegmentWritable<XYObjectWritable, XYObjectWritable>[] = [];
  sidesInto(out, bounds);
  return out;
}
