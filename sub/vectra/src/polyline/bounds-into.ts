import type { BoundsWritable, Polyline } from '../types/flat-shapes.internal';

/**
 * polyline의 axis-aligned bounds를 out에 기록하고 같은 out을 반환한다.
 *
 * empty polyline은 sentinel empty bounds인 min=(Infinity, Infinity), max=(-Infinity, -Infinity)를 기록한다.
 * @param out bounds를 기록할 writable output (`minX`, `minY`, `maxX`, `maxY`)
 * @param polyline bounds를 계산할 polyline
 */
export function boundsInto<Out extends BoundsWritable>(out: Out, polyline: Polyline): Out {
  const points = polyline;

  if (points.length === 0) {
    out.minX = Infinity;
    out.minY = Infinity;
    out.maxX = -Infinity;
    out.maxY = -Infinity;
    return out;
  }

  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = minX;
  let maxY = minY;

  for (let i = 1; i < points.length; i++) {
    const px = points[i].x;
    const py = points[i].y;
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
