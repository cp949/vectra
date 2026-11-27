import type { Ellipse, Point, PointWritable } from '../types/flat-shapes.internal';
import { ellipseClosestPointAngle } from './ellipse-closest-point.internal';

/** Newton-Raphson 수렴 판정 기본 epsilon */
const DEFAULT_EPSILON = 1e-10;

/**
 * ellipse boundary에서 point에 가장 가까운 점을 plain object로 반환한다.
 *
 * 거리는 Euclidean 거리다. 반환한 점에서 point로 향하는 선은 boundary에 수직이다.
 * 내부 점도 경계 위의 closest boundary point를 반환한다.
 * rx <= 0 또는 ry <= 0인 empty ellipse는 ellipse center를 반환한다.
 * point가 ellipse 중심에 있으면 minor axis의 양의 방향 vertex를 반환한다.
 * rx > ry이면 (cx, cy + ry), 아니면 (cx + rx, cy)이다. rx === ry도 후자다.
 * major axis 위의 점이 evolute 안에 있으면 최근접점이 둘이다.
 * 이때 center보다 y가 큰 쪽을 반환한다. ry > rx이면 x가 큰 쪽을 반환한다.
 * 반복 수치 해법이다. 수렴 실패 시 마지막 반복 값을 사용한다.
 *
 * @param ellipse 기준 ellipse
 * @param point closest point를 계산할 기준 point
 * @param epsilon Newton-Raphson 수렴 판정 상대 임계값. 기본값: 1e-10
 */
export function closestPoint(ellipse: Ellipse, point: Point, epsilon = DEFAULT_EPSILON): PointWritable {
  const rx = ellipse.rx;
  const ry = ellipse.ry;

  const cx = ellipse.cx;
  const cy = ellipse.cy;

  // empty ellipse는 center를 반환한다
  if (rx <= 0 || ry <= 0) return { x: cx, y: cy };

  const dx = point.x - cx;
  const dy = point.y - cy;

  const theta = ellipseClosestPointAngle(dx, dy, rx, ry, epsilon);

  return { x: cx + Math.cos(theta) * rx, y: cy + Math.sin(theta) * ry };
}
