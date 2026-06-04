import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, XYInput, XYObjectWritable } from '../types';
import { ellipseClosestPointAngle } from './ellipse-closest-point.internal';

/** Newton-Raphson 수렴 판정 기본 epsilon */
const DEFAULT_EPSILON = 1e-10;

/**
 * ellipse boundary에서 point에 가장 가까운 점을 plain object로 반환한다.
 *
 * 내부 점도 경계 위의 closest boundary point를 반환한다.
 * radiusX <= 0 또는 radiusY <= 0인 empty ellipse는 ellipse center를 반환한다.
 * point === ellipse center인 경우 θ₀ = 0으로 tie-break하여 (cx + radiusX, cy)를 반환한다.
 *
 * @param ellipse 기준 ellipse
 * @param point closest point를 계산할 기준 point
 * @param epsilon Newton-Raphson 수렴 판정 임계값. 기본값: 1e-10
 */
export function closestPoint(ellipse: EllipseLike, point: XYInput, epsilon = DEFAULT_EPSILON): XYObjectWritable {
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);

  const center = readEllipseCenter(ellipse);
  const cx = readX(center);
  const cy = readY(center);

  // empty ellipse는 center를 반환한다
  if (rx <= 0 || ry <= 0) return { x: cx, y: cy };

  const dx = readX(point) - cx;
  const dy = readY(point) - cy;

  const theta = ellipseClosestPointAngle(dx, dy, rx, ry, epsilon);

  return { x: cx + Math.cos(theta) * rx, y: cy + Math.sin(theta) * ry };
}
