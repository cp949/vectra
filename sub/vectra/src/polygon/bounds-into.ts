import { readPolygonPoints } from '../internal/polygon';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsWritable, PolygonLike, XYWritable } from '../types';

/**
 * polygon을 감싸는 axis-aligned bounding bounds를 out에 기록하고 out을 반환한다.
 *
 * empty polygon(pointCount === 0)에서는 Infinity/-Infinity sentinel을 기록한다.
 * out과 입력 point element가 alias되어도 안전하다.
 *
 * @param out bounds를 기록할 writable output
 * @param polygon bounds를 계산할 polygon
 */
export function boundsInto<Out extends BoundsWritable<XYWritable, XYWritable>>(out: Out, polygon: PolygonLike): Out {
  const pts = readPolygonPoints(polygon);

  if (pts.length === 0) {
    writeXY(out.min, Infinity, Infinity);
    writeXY(out.max, -Infinity, -Infinity);
    return out;
  }

  let minX = readX(pts[0]);
  let minY = readY(pts[0]);
  let maxX = minX;
  let maxY = minY;

  for (let i = 1; i < pts.length; i++) {
    const px = readX(pts[i]);
    const py = readY(pts[i]);
    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  }

  writeXY(out.min, minX, minY);
  writeXY(out.max, maxX, maxY);
  return out;
}
