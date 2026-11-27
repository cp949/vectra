import type { Bounds, SegmentWritable } from '../types/flat-shapes.internal';
import { sidesInto } from './sides-into';

/**
 * bounds의 4개 변(edge)을 새 배열로 반환한다.
 *
 * top, right, bottom, left 순서로 새 `SegmentWritable` object를 담은 배열을 반환한다.
 * 반환 배열 길이는 항상 4이다.
 *
 * 각 변은 두 끝점의 좌표를 담은 독립 선분 객체다.
 * empty/inverted bounds와 sentinel bounds에서도 raw 좌표로 4개 변을 반환한다.
 * caller가 미리 `isEmpty`로 거른다.
 *
 * @param bounds 변을 읽을 bounds
 */
export function sides(bounds: Bounds): SegmentWritable[] {
  return sidesInto([], bounds);
}
