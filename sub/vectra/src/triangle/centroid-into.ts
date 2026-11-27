import type { Triangle, PointWritable } from '../types/flat-shapes.internal';

/**
 * triangle 세 vertex의 arithmetic mean을 centroid로 계산해 out에 기록하고 반환한다.
 *
 * degenerate triangle(collinear)도 arithmetic mean 그대로 계산한다.
 * non-finite vertex는 IEEE 754 전파 규칙을 따른다.
 *
 * @param out centroid를 기록할 점 객체
 * @param triangle centroid를 계산할 triangle
 * @returns out
 */
export function centroidInto<Out extends PointWritable>(out: Out, triangle: Triangle): Out {
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;
  out.x = (ax + bx + cx) / 3;
  out.y = (ay + by + cy) / 3;
  return out;
}
