import type { SegmentWritable, Triangle } from '../types/flat-shapes.internal';

/**
 * triangle의 index에 해당하는 opposite side를 out에 기록하고 true를 반환한다.
 *
 * index는 vertex의 opposite side를 가리킨다:
 * - index 0 → side BC (vertex a의 맞은편, b→c)
 * - index 1 → side CA (vertex b의 맞은편, c→a)
 * - index 2 → side AB (vertex c의 맞은편, a→b)
 *
 * invalid index(음수, 3 이상, NaN)는 false를 반환하고 out을 수정하지 않는다.
 *
 * @param out 맞은편 변을 기록할 선분 객체
 * @param triangle 변을 읽을 triangle
 * @param index 기준 꼭짓점 번호
 */
export function sideAtInto(out: SegmentWritable, triangle: Triangle, index: number): boolean {
  let startX: number;
  let startY: number;
  let endX: number;
  let endY: number;

  if (index === 0) {
    // side BC: b→c
    startX = triangle.x2;
    startY = triangle.y2;
    endX = triangle.x3;
    endY = triangle.y3;
  } else if (index === 1) {
    // side CA: c→a
    startX = triangle.x3;
    startY = triangle.y3;
    endX = triangle.x1;
    endY = triangle.y1;
  } else if (index === 2) {
    // side AB: a→b
    startX = triangle.x1;
    startY = triangle.y1;
    endX = triangle.x2;
    endY = triangle.y2;
  } else {
    return false;
  }

  out.x1 = startX;
  out.y1 = startY;
  out.x2 = endX;
  out.y2 = endY;
  return true;
}
