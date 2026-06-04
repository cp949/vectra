import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY, writeXY } from '../internal/xy';
import type { EllipseLike, SegmentWritable, XYWritable } from '../types';

/**
 * ellipse의 두 초점을 out에 기록하고 out을 반환한다.
 *
 * 장축 방향이 x축이면 초점은 (cx ± c, cy), y축이면 (cx, cy ± c).
 * 원(rx == ry) 또는 empty ellipse(rx <= 0 || ry <= 0)이면 두 초점 모두 center를 기록한다.
 *
 * @param out 초점 두 개를 기록할 SegmentWritable output
 * @param ellipse 초점을 계산할 ellipse
 */
export function fociInto<A extends XYWritable, B extends XYWritable>(
  out: SegmentWritable<A, B>,
  ellipse: EllipseLike
): SegmentWritable<A, B> {
  const center = readEllipseCenter(ellipse);
  const cx = readX(center);
  const cy = readY(center);
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);

  // empty ellipse 또는 원: 두 초점 = center
  if (rx <= 0 || ry <= 0 || rx === ry) {
    writeXY(out.a, cx, cy);
    writeXY(out.b, cx, cy);
    return out;
  }

  if (rx > ry) {
    // 장축이 x축: 초점 = (cx ± c, cy)
    const c = Math.sqrt(rx * rx - ry * ry);
    writeXY(out.a, cx - c, cy);
    writeXY(out.b, cx + c, cy);
  } else {
    // 장축이 y축: 초점 = (cx, cy ± c)
    const c = Math.sqrt(ry * ry - rx * rx);
    writeXY(out.a, cx, cy - c);
    writeXY(out.b, cx, cy + c);
  }

  return out;
}
