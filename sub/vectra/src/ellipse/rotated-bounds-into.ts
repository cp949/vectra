import {
  readRotatedEllipseCenter,
  readRotatedEllipseRadiusX,
  readRotatedEllipseRadiusY,
  readRotatedEllipseRotation,
} from '../internal/ellipse';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsWritable, RotatedEllipseLike, XYWritable } from '../types';

/**
 * rotated ellipse를 포함하는 axis-aligned bounds를 out에 기록하고 out을 반환한다.
 *
 * oriented bounds가 아니라 AABB다. 전체 ellipse의 closed-form half-extent(φ = rotation):
 *   Δx = sqrt(radiusX²·cos²φ + radiusY²·sin²φ)
 *   Δy = sqrt(radiusX²·sin²φ + radiusY²·cos²φ)
 *   min = (cx - Δx, cy - Δy), max = (cx + Δx, cy + Δy)
 * half-extent는 `Math.hypot`으로 계산해 finite 큰 radius overflow와 subnormal underflow를 줄인다.
 * radiusX <= 0 또는 radiusY <= 0인 empty ellipse는 sentinel empty bounds
 * (min = (+Inf, +Inf), max = (-Inf, -Inf))를 기록한다.
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out bounds를 기록할 writable output
 * @param ellipse bounds로 변환할 rotated ellipse
 */
export function rotatedBoundsInto<Out extends BoundsWritable<XYWritable, XYWritable>>(
  out: Out,
  ellipse: RotatedEllipseLike
): Out {
  const center = readRotatedEllipseCenter(ellipse);
  const cx = readX(center);
  const cy = readY(center);
  const rx = readRotatedEllipseRadiusX(ellipse);
  const ry = readRotatedEllipseRadiusY(ellipse);

  // empty ellipse: sentinel empty bounds
  if (rx <= 0 || ry <= 0) {
    writeXY(out.min, Infinity, Infinity);
    writeXY(out.max, -Infinity, -Infinity);
    return out;
  }

  const phi = readRotatedEllipseRotation(ellipse);
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const rxCos = rx * cosPhi;
  const rxSin = rx * sinPhi;
  const ryCos = ry * cosPhi;
  const rySin = ry * sinPhi;
  const dx = Math.hypot(rxCos, rySin);
  const dy = Math.hypot(rxSin, ryCos);
  writeXY(out.min, cx - dx, cy - dy);
  writeXY(out.max, cx + dx, cy + dy);
  return out;
}
