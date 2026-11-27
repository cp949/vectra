import type { Ellipse, Point } from '../types/flat-shapes.internal';
import { ellipseClosestPointAngle } from './ellipse-closest-point.internal';
import { hypot2 } from '../internal/numeric';

/** Newton-Raphson 수렴 판정 기본 epsilon */
const DEFAULT_EPSILON = 1e-10;

/**
 * ellipse와 point 사이의 최단 거리를 반환한다.
 *
 * closed filled ellipse 기준: point가 ellipse 내부 또는 boundary 위에 있으면 0을 반환한다.
 * 외부 점은 boundary 위 Euclidean closest point까지의 거리를 반환한다.
 * rx <= 0 또는 ry <= 0인 empty ellipse는 point에서 ellipse center까지 Euclidean 거리를 반환한다.
 *
 * @param ellipse 기준 ellipse
 * @param point 거리를 측정할 point
 * @param epsilon Newton-Raphson 수렴 판정 상대 임계값. 기본값: 1e-10
 */
export function distanceToPoint(ellipse: Ellipse, point: Point, epsilon = DEFAULT_EPSILON): number {
  const rx = ellipse.rx;
  const ry = ellipse.ry;

  const cx = ellipse.cx;
  const cy = ellipse.cy;

  const px = point.x;
  const py = point.y;

  // empty ellipse는 center까지 Euclidean 거리를 반환한다
  if (rx <= 0 || ry <= 0) {
    const ddx = px - cx;
    const ddy = py - cy;
    return hypot2(ddx, ddy);
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
  return hypot2(edx, edy);
}
