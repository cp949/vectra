import type { Ellipse, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * ellipse의 두 초점을 out에 기록하고 out을 반환한다.
 *
 * 장축 방향이 x축이면 초점은 (cx ± c, cy), y축이면 (cx, cy ± c).
 * 원(rx == ry) 또는 empty ellipse(rx <= 0 || ry <= 0)이면 두 초점 모두 center를 기록한다.
 *
 * @param out 초점 두 개를 기록할 선분 객체
 * @param ellipse 초점을 계산할 ellipse
 */
export function fociInto<Out extends SegmentWritable>(out: Out, ellipse: Ellipse): Out {
  const cx = ellipse.cx;
  const cy = ellipse.cy;
  const rx = ellipse.rx;
  const ry = ellipse.ry;

  // empty ellipse 또는 원: 두 초점 = center
  if (rx <= 0 || ry <= 0 || rx === ry) {
    out.x1 = cx;
    out.y1 = cy;
    out.x2 = cx;
    out.y2 = cy;
    return out;
  }

  if (rx > ry) {
    // 장축이 x축: 초점 = (cx ± c, cy)
    const c = Math.sqrt(rx * rx - ry * ry);
    out.x1 = cx - c;
    out.y1 = cy;
    out.x2 = cx + c;
    out.y2 = cy;
  } else {
    // 장축이 y축: 초점 = (cx, cy ± c)
    const c = Math.sqrt(ry * ry - rx * rx);
    out.x1 = cx;
    out.y1 = cy - c;
    out.x2 = cx;
    out.y2 = cy + c;
  }

  return out;
}
