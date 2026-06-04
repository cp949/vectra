import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY, writeXY } from '../internal/xy';
import type { EllipseLike, EllipseWritable, XYInput, XYWritable } from '../types';

/**
 * ellipse의 center와 반지름을 out에 복사하고 out을 반환한다.
 *
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out ellipse 값을 기록할 writable output
 * @param ellipse 복사할 ellipse
 */
export function copyInto<Out extends EllipseWritable<XYWritable>>(out: Out, ellipse: EllipseLike): Out;
/**
 * ellipse의 center와 반지름을 out에 복사하고 out을 반환한다.
 *
 * @param out ellipse 값을 기록할 writable output
 * @param center center 좌표
 * @param radiusX x축 반지름
 * @param radiusY y축 반지름
 */
export function copyInto<Out extends EllipseWritable<XYWritable>>(
  out: Out,
  center: XYInput,
  radiusX: number,
  radiusY: number
): Out;
export function copyInto<Out extends EllipseWritable<XYWritable>>(
  out: Out,
  ellipseOrCenter: EllipseLike | XYInput,
  radiusX?: number,
  radiusY?: number
): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const center =
    radiusX === undefined ? readEllipseCenter(ellipseOrCenter as EllipseLike) : (ellipseOrCenter as XYInput);
  const cx = readX(center);
  const cy = readY(center);
  const rx = radiusX === undefined ? readEllipseRadiusX(ellipseOrCenter as EllipseLike) : radiusX;
  const ry = radiusY === undefined ? readEllipseRadiusY(ellipseOrCenter as EllipseLike) : radiusY;
  writeXY(out.center, cx, cy);
  out.radiusX = rx;
  out.radiusY = ry as number;
  return out;
}
