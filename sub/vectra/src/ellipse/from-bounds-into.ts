import type { Bounds, EllipseWritable } from '../types/flat-shapes.internal';

/**
 * bounds에서 ellipse를 생성해 out에 기록하고 out을 반환한다.
 *
 * center = bounds 중심, rx = width/2, ry = height/2.
 * empty bounds(maxX < minX || maxY < minY)이면 rx = 0, ry = 0,
 * center에 (minX, minY)를 기록한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out ellipse를 기록할 객체
 * @param bounds ellipse를 생성할 bounds
 */
export function fromBoundsInto<Out extends EllipseWritable>(out: Out, bounds: Bounds): Out {
  const minX = bounds.minX;
  const minY = bounds.minY;
  const maxX = bounds.maxX;
  const maxY = bounds.maxY;

  // empty bounds: center = min, radii = 0
  if (maxX < minX || maxY < minY) {
    out.cx = minX;
    out.cy = minY;
    out.rx = 0;
    out.ry = 0;
    return out;
  }

  const w = maxX - minX;
  const h = maxY - minY;
  out.cx = minX + w * 0.5;
  out.cy = minY + h * 0.5;
  out.rx = w * 0.5;
  out.ry = h * 0.5;
  return out;
}
