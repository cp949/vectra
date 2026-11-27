import type { Polygon, BoundsWritable } from '../types/flat-shapes.internal';

/**
 * polygon을 감싸는 axis-aligned bounding bounds를 out에 기록하고 out을 반환한다.
 *
 * empty polygon(pointCount === 0)에서는 `minX = minY = Infinity`, `maxX = maxY = -Infinity`를 기록한다.
 *
 * @param out bounds를 기록할 writable output (`minX, minY, maxX, maxY`)
 * @param polygon bounds를 계산할 polygon
 */
export function boundsInto<Out extends BoundsWritable>(out: Out, polygon: Polygon): Out {
  if (polygon.length === 0) {
    out.minX = Infinity;
    out.minY = Infinity;
    out.maxX = -Infinity;
    out.maxY = -Infinity;
    return out;
  }

  let minX = polygon[0];
  let minY = polygon[1];
  let maxX = minX;
  let maxY = minY;

  for (let i = 2; i < polygon.length; i += 2) {
    const px = polygon[i];
    const py = polygon[i + 1];
    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  }

  out.minX = minX;
  out.minY = minY;
  out.maxX = maxX;
  out.maxY = maxY;
  return out;
}
