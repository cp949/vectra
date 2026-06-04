import { readPolylinePoints } from '../internal/polyline';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsWritable, PolylineLike, XYWritable } from '../types';

/**
 * polyline의 axis-aligned bounds를 out에 기록하고 같은 out을 반환한다.
 *
 * empty polyline은 sentinel empty bounds인 min=(Infinity, Infinity), max=(-Infinity, -Infinity)를 기록한다.
 * out.min/out.max가 polyline point와 alias되어도 안전하다.
 *
 * @param out bounds를 기록할 writable output
 * @param polyline bounds를 계산할 polyline
 */
export function boundsInto<Out extends BoundsWritable<XYWritable, XYWritable>>(out: Out, polyline: PolylineLike): Out {
  const points = readPolylinePoints(polyline);

  if (points.length === 0) {
    writeXY(out.min, Infinity, Infinity);
    writeXY(out.max, -Infinity, -Infinity);
    return out;
  }

  let minX = readX(points[0]);
  let minY = readY(points[0]);
  let maxX = minX;
  let maxY = minY;

  for (let i = 1; i < points.length; i++) {
    const px = readX(points[i]);
    const py = readY(points[i]);
    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  }

  writeXY(out.min, minX, minY);
  writeXY(out.max, maxX, maxY);
  return out;
}
