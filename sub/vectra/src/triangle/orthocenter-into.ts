import { readTriangleRawCoords } from '../internal/triangle';
import { solveTriangleCircumcenter } from '../internal/triangle-circumcenter';
import { writeXY } from '../internal/xy';
import type { TriangleLike, XYWritable } from '../types';

const center = { x: 0, y: 0 };

/**
 * triangle의 수심(orthocenter)을 계산해 out에 기록하고 out을 반환한다.
 *
 * degenerate triangle(collinear 또는 non-finite vertex)이면 out을 수정하지 않고 false를 반환한다.
 * input과 output이 같은 object여도 안전하다(aliasing 허용).
 *
 * @param out 수심 좌표를 기록할 writable output
 * @param triangle 수심을 계산할 triangle
 * @returns out 또는 false(degenerate)
 */
export function orthocenterInto<Out extends XYWritable>(out: Out, triangle: TriangleLike): Out | false {
  if (!solveTriangleCircumcenter(center, triangle)) return false;
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  const ux = center.x;
  const uy = center.y;
  // orthocenter = vertex 좌표 합 − 2 × circumcenter (Euler line 관계)
  writeXY(out, ax + bx + cx - 2 * ux, ay + by + cy - 2 * uy);
  return out;
}
