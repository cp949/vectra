import type { Triangle, PointWritable } from '../types/flat-shapes.internal';

/**
 * triangle의 index번째 vertex를 out에 기록하고 true를 반환한다.
 * valid index: 0(a), 1(b), 2(c).
 * invalid index는 false를 반환하고 out을 수정하지 않는다.
 *
 * @param out 꼭짓점 좌표를 기록할 점 객체
 * @param triangle 꼭짓점을 읽을 triangle
 * @param index 꼭짓점 번호
 */
export function pointAtIndexInto(out: PointWritable, triangle: Triangle, index: number): boolean {
  let x: number;
  let y: number;
  if (index === 0) {
    x = triangle.x1;
    y = triangle.y1;
  } else if (index === 1) {
    x = triangle.x2;
    y = triangle.y2;
  } else if (index === 2) {
    x = triangle.x3;
    y = triangle.y3;
  } else {
    return false;
  }
  out.x = x;
  out.y = y;
  return true;
}
