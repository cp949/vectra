import type { Ellipse, EllipseWritable, Point } from '../types/flat-shapes.internal';

/**
 * ellipse의 center와 radii에 non-uniform scale을 적용한 결과를 out에 기록하고 out을 반환한다.
 *
 * cx *= scale.x, cy *= scale.y, rx *= scale.x, ry *= scale.y.
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 타원 객체
 * @param ellipse scale할 ellipse
 * @param scale x/y 축별 scale 배율
 */
export function scaleInto<Out extends EllipseWritable>(out: Out, ellipse: Ellipse, scale: Point): Out {
  // aliasing 안전 - 입력을 먼저 읽은 후 기록한다
  const { cx, cy, rx, ry } = ellipse;
  const sx = scale.x;
  const sy = scale.y;
  out.cx = cx * sx;
  out.cy = cy * sy;
  out.rx = rx * sx;
  out.ry = ry * sy;
  return out;
}
