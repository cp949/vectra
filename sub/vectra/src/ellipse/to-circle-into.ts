import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY, writeXY } from '../internal/xy';
import type { CircleWritable, EllipseLike, XYWritable } from '../types';

/**
 * `radiusX === radiusY`인 ellipse만 circle로 변환해 out에 기록하고 out을 반환한다.
 *
 * 두 radius가 정확히 일치할 때만 성공한다 (`===` 비교, epsilon 없음). 한 ULP라도 다르면 실패.
 * 성공 시 `out.center = ellipse.center`, `out.radius = radiusX`로 기록하고 `out`을 반환한다.
 * `radiusX === radiusY`가 `0` 또는 같은 음수여도 structural circle로 기록한다.
 * NaN radii는 `NaN === NaN`이 false이므로 실패한다.
 * 실패 시 `out`을 수정하지 않고 `false`를 반환한다.
 * `out.center`가 `ellipse.center`와 alias되어도 안전하다.
 *
 * @param out circle을 기록할 writable output
 * @param ellipse circle로 변환할 ellipse
 */
export function toCircleInto<Out extends CircleWritable<XYWritable>>(out: Out, ellipse: EllipseLike): Out | false {
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);
  if (rx !== ry) return false;
  const cx = readX(readEllipseCenter(ellipse));
  const cy = readY(readEllipseCenter(ellipse));
  writeXY(out.center, cx, cy);
  out.radius = rx;
  return out;
}
