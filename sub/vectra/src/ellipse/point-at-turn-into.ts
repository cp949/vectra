import type { Ellipse, PointWritable } from '../types/flat-shapes.internal';

/**
 * 매개변수 turn 위치의 ellipse 표면 point를 out에 기록하고 out을 반환한다.
 *
 * angle = turn * 2 * Math.PI로 변환한다. turn wrap/clamp 없음.
 * rx <= 0 또는 ry <= 0인 empty ellipse는 center를 기록한다.
 *
 * @param out 표면 point를 기록할 객체
 * @param ellipse 표면 point를 계산할 ellipse
 * @param turn [0, 1) 범위를 가정하는 angle fraction (wrap 없음)
 */
export function pointAtTurnInto<Out extends PointWritable>(out: Out, ellipse: Ellipse, turn: number): Out {
  const cx = ellipse.cx;
  const cy = ellipse.cy;
  const rx = ellipse.rx;
  const ry = ellipse.ry;

  // empty ellipse이면 center를 기록한다
  if (rx <= 0 || ry <= 0) {
    out.x = cx;
    out.y = cy;
    return out;
  }

  const angle = turn * 2 * Math.PI;
  out.x = cx + Math.cos(angle) * rx;
  out.y = cy + Math.sin(angle) * ry;
  return out;
}
