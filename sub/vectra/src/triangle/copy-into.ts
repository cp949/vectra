import type { Triangle, TriangleWritable } from '../types/flat-shapes.internal';

/**
 * triangle의 꼭짓점 좌표를 out에 복사하고 out을 반환한다.
 *
 * @param out 복사한 좌표를 기록할 삼각형 객체
 * @param triangle 복사할 triangle
 */
export function copyInto<Out extends TriangleWritable>(out: Out, triangle: Triangle): Out {
  const { x1, y1, x2, y2, x3, y3 } = triangle;
  out.x1 = x1;
  out.y1 = y1;
  out.x2 = x2;
  out.y2 = y2;
  out.x3 = x3;
  out.y3 = y3;
  return out;
}
