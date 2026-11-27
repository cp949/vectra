import type { BoundsWritable, Ellipse } from '../types/flat-shapes.internal';

/**
 * ellipse를 포함하는 axis-aligned bounds를 out에 기록하고 out을 반환한다.
 *
 * min = (cx - rx, cy - ry), max = (cx + rx, cy + ry).
 * empty ellipse(rx <= 0 || ry <= 0)이면 sentinel empty bounds를 기록한다.
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out bounds를 기록할 객체
 * @param ellipse bounds로 변환할 ellipse
 */
export function boundsInto<Out extends BoundsWritable>(out: Out, ellipse: Ellipse): Out {
  const cx = ellipse.cx;
  const cy = ellipse.cy;
  const rx = ellipse.rx;
  const ry = ellipse.ry;

  // empty ellipse: sentinel empty bounds
  if (rx <= 0 || ry <= 0) {
    out.minX = Infinity;
    out.minY = Infinity;
    out.maxX = -Infinity;
    out.maxY = -Infinity;
    return out;
  }

  out.minX = cx - rx;
  out.minY = cy - ry;
  out.maxX = cx + rx;
  out.maxY = cy + ry;
  return out;
}
