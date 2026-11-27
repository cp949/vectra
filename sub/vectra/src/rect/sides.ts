import type { Rect, SegmentWritable } from '../types/flat-shapes.internal';
import { sidesInto } from './sides-into';

/**
 * rect의 4개 변(edge)을 새 배열로 반환한다.
 *
 * top, right, bottom, left 순서로 새 `SegmentWritable` object를 담은 배열을 반환한다.
 * 반환 배열 길이는 항상 4이다.
 *
 * 각 변은 두 끝점의 좌표를 담은 독립 선분 객체다.
 * empty rect에서도 raw 좌표로 4개 변을 반환한다. zero-length side는 그대로 반환한다.
 *
 * @param rect 변을 읽을 rect
 */
export function sides(rect: Rect): SegmentWritable[] {
  return sidesInto([], rect);
}
