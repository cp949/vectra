import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsLike, EllipseWritable, XYWritable } from '../types';

/**
 * bounds에서 ellipse를 생성해 out에 기록하고 out을 반환한다.
 *
 * center = bounds 중심, radiusX = width/2, radiusY = height/2.
 * empty bounds(max.x < min.x || max.y < min.y)이면 radiusX = 0, radiusY = 0,
 * center에 (min.x, min.y)를 기록한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out ellipse를 기록할 writable output
 * @param bounds ellipse를 생성할 bounds
 */
export function fromBoundsInto<Out extends EllipseWritable<XYWritable>>(out: Out, bounds: BoundsLike): Out {
  const minX = readX(readBoundsMin(bounds));
  const minY = readY(readBoundsMin(bounds));
  const maxX = readX(readBoundsMax(bounds));
  const maxY = readY(readBoundsMax(bounds));

  // empty bounds: center = min, radii = 0
  if (maxX < minX || maxY < minY) {
    writeXY(out.center, minX, minY);
    out.radiusX = 0;
    out.radiusY = 0;
    return out;
  }

  const w = maxX - minX;
  const h = maxY - minY;
  writeXY(out.center, minX + w * 0.5, minY + h * 0.5);
  out.radiusX = w * 0.5;
  out.radiusY = h * 0.5;
  return out;
}
