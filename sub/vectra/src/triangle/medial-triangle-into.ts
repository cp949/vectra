import type { Triangle, TriangleWritable } from '../types/flat-shapes.internal';

/**
 * 세 side의 midpoint를 vertex로 하는 medial triangle을 out에 기록하고 out을 반환한다.
 *
 * medial triangle의 각 vertex:
 * - (out.x1, out.y1) = midpoint(a, b)
 * - (out.x2, out.y2) = midpoint(b, c)
 * - (out.x3, out.y3) = midpoint(c, a)
 *
 * degenerate triangle(collinear)에서도 각 side의 midpoint를 계산한다.
 * non-finite vertex는 IEEE 754 연산 결과를 그대로 반환한다.
 *
 * @param out 세 변의 중점을 기록할 triangle 객체
 * @param triangle 세 변의 중점을 구할 triangle
 */
export function medialTriangleInto<Out extends TriangleWritable>(out: Out, triangle: Triangle): Out {
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;

  // (out.x1, out.y1) = midpoint(a, b)
  out.x1 = (ax + bx) / 2;
  out.y1 = (ay + by) / 2;
  // (out.x2, out.y2) = midpoint(b, c)
  out.x2 = (bx + cx) / 2;
  out.y2 = (by + cy) / 2;
  // (out.x3, out.y3) = midpoint(c, a)
  out.x3 = (cx + ax) / 2;
  out.y3 = (cy + ay) / 2;

  return out;
}
