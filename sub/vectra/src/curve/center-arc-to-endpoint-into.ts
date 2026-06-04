import type { ArcCommandWritable, CenterArcLike } from '../types';
import { ellipsePoint, isDegenerateRadii } from './arc.internal';

/**
 * center form arc를 SVG 호환 endpoint form으로 변환하여 out에 기록하고 out을 반환한다.
 *
 * `out.x`, `out.y`는 endAngle 위치의 점이다. `from(시작점)`은 caller가 별도 관리한다.
 * `largeArc`는 sweep angle의 절댓값이 π 이상인지로 결정한다.
 * `sweep`은 center arc의 sweep flag를 그대로 옮긴다.
 * degenerate (rx <= 0 또는 ry <= 0)이면 endpoint는 center 좌표가 된다.
 *
 * @param out endpoint form을 기록할 writable output (kind='arc' fixed)
 * @param centerArc center form arc input
 * @returns out
 */
export function centerArcToEndpointInto<Out extends ArcCommandWritable>(out: Out, centerArc: CenterArcLike): Out {
  const { cx, cy, rx, ry, xRotation, startAngle, endAngle, sweep } = centerArc;

  out.kind = 'arc';
  out.rx = rx;
  out.ry = ry;
  out.xRotation = xRotation;
  out.sweep = sweep;

  if (isDegenerateRadii(rx, ry)) {
    out.x = cx;
    out.y = cy;
    out.largeArc = false;
    return out;
  }

  const point: [number, number] = [0, 0];
  ellipsePoint(cx, cy, rx, ry, xRotation, endAngle, point);
  out.x = point[0];
  out.y = point[1];

  out.largeArc = Math.abs(endAngle - startAngle) >= Math.PI;
  return out;
}
