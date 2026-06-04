import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, XYInput } from '../types';
import { ellipseClosestPointAngle } from './ellipse-closest-point.internal';

/** Newton-Raphson 수렴 판정 기본 epsilon */
const DEFAULT_EPSILON = 1e-10;

/**
 * ellipse와 point 사이의 최단 거리를 반환한다.
 *
 * closed filled ellipse 기준: point가 ellipse 내부 또는 boundary 위에 있으면 0을 반환한다.
 * radiusX <= 0 또는 radiusY <= 0인 empty ellipse는 point에서 ellipse center까지 Euclidean 거리를 반환한다.
 *
 * @param ellipse 기준 ellipse
 * @param point 거리를 측정할 point
 * @param epsilon Newton-Raphson 수렴 판정 임계값. 기본값: 1e-10
 */
export function distanceToPoint(ellipse: EllipseLike, point: XYInput, epsilon = DEFAULT_EPSILON): number {
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);

  const center = readEllipseCenter(ellipse);
  const cx = readX(center);
  const cy = readY(center);

  const px = readX(point);
  const py = readY(point);

  // empty ellipse는 center까지 Euclidean 거리를 반환한다
  if (rx <= 0 || ry <= 0) {
    const ddx = px - cx;
    const ddy = py - cy;
    return Math.hypot(ddx, ddy);
  }

  const dx = px - cx;
  const dy = py - cy;

  // point가 내부 또는 boundary 위이면 0을 반환한다
  const nx = dx / rx;
  const ny = dy / ry;
  if (nx * nx + ny * ny <= 1) return 0;

  const theta = ellipseClosestPointAngle(dx, dy, rx, ry, epsilon);

  const bx = cx + Math.cos(theta) * rx;
  const by = cy + Math.sin(theta) * ry;

  const edx = px - bx;
  const edy = py - by;
  return Math.hypot(edx, edy);
}
