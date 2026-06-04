import { readTriangleRawCoords } from '../internal/triangle';
import { writeXY } from '../internal/xy';
import type { TriangleLike, XYWritable } from '../types';

/**
 * triangle 세 vertex의 arithmetic mean을 centroid로 계산해 out에 기록하고 반환한다.
 *
 * degenerate triangle(collinear)도 arithmetic mean 그대로 계산한다.
 * non-finite vertex는 IEEE 754 전파 규칙을 따른다.
 *
 * @param out centroid를 기록할 writable output
 * @param triangle centroid를 계산할 triangle
 * @returns out
 */
export function centroidInto<Out extends XYWritable>(out: Out, triangle: TriangleLike): Out {
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  writeXY(out, (ax + bx + cx) / 3, (ay + by + cy) / 3);
  return out;
}
