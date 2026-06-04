import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsWritable, EllipseLike, XYWritable } from '../types';

/**
 * ellipse를 포함하는 axis-aligned bounds를 out에 기록하고 out을 반환한다.
 *
 * min = (cx - rx, cy - ry), max = (cx + rx, cy + ry).
 * empty ellipse(radiusX <= 0 || radiusY <= 0)이면 sentinel empty bounds를 기록한다.
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out bounds를 기록할 writable output
 * @param ellipse bounds로 변환할 ellipse
 */
export function boundsInto<Out extends BoundsWritable<XYWritable, XYWritable>>(out: Out, ellipse: EllipseLike): Out {
  const cx = readX(readEllipseCenter(ellipse));
  const cy = readY(readEllipseCenter(ellipse));
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);

  // empty ellipse: sentinel empty bounds
  if (rx <= 0 || ry <= 0) {
    writeXY(out.min, Infinity, Infinity);
    writeXY(out.max, -Infinity, -Infinity);
    return out;
  }

  writeXY(out.min, cx - rx, cy - ry);
  writeXY(out.max, cx + rx, cy + ry);
  return out;
}
