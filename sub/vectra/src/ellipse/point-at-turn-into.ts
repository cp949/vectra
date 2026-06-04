import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY, writeXY } from '../internal/xy';
import type { EllipseLike, XYWritable } from '../types';

/**
 * 매개변수 turn 위치의 ellipse 표면 point를 out에 기록하고 out을 반환한다.
 *
 * angle = turn * 2 * Math.PI로 변환한다. turn wrap/clamp 없음.
 * radiusX <= 0 또는 radiusY <= 0인 empty ellipse는 center를 기록한다.
 *
 * @param out 표면 point를 기록할 writable output
 * @param ellipse 표면 point를 계산할 ellipse
 * @param turn [0, 1) 범위를 가정하는 angle fraction (wrap 없음)
 */
export function pointAtTurnInto<Out extends XYWritable>(out: Out, ellipse: EllipseLike, turn: number): Out {
  const cx = readX(readEllipseCenter(ellipse));
  const cy = readY(readEllipseCenter(ellipse));
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);

  // empty ellipse이면 center를 기록한다
  if (rx <= 0 || ry <= 0) return writeXY(out, cx, cy);

  const angle = turn * 2 * Math.PI;
  return writeXY(out, cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry);
}
