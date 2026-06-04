import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY, writeXY } from '../internal/xy';
import type { EllipseLike, EllipseWritable, XYInput, XYWritable } from '../types';

/**
 * ellipse의 center와 radii에 non-uniform scale을 적용한 결과를 out에 기록하고 out을 반환한다.
 *
 * center.x *= scale.x, center.y *= scale.y, radiusX *= scale.x, radiusY *= scale.y.
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out scale 결과를 기록할 writable output
 * @param ellipse scale할 ellipse
 * @param scale x/y 축별 scale 배율
 */
export function scaleInto<Out extends EllipseWritable<XYWritable>>(
  out: Out,
  ellipse: EllipseLike,
  scale: XYInput
): Out {
  // aliasing 안전 - 입력을 먼저 읽은 후 기록한다
  const cx = readX(readEllipseCenter(ellipse));
  const cy = readY(readEllipseCenter(ellipse));
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);
  const sx = readX(scale);
  const sy = readY(scale);
  writeXY(out.center, cx * sx, cy * sy);
  out.radiusX = rx * sx;
  out.radiusY = ry * sy;
  return out;
}
