import type { Ellipse, Point, PointWritable } from '../types/flat-shapes.internal';
import { ellipseClosestPointAngle } from './ellipse-closest-point.internal';

/** Newton-Raphson 수렴 판정 기본 epsilon */
const DEFAULT_EPSILON = 1e-10;

/**
 * ellipse boundary에서 point에 가장 가까운 점을 out에 기록하고 out을 반환한다.
 *
 * 거리는 Euclidean 거리다. 기록한 점에서 point로 향하는 선은 boundary에 수직이다.
 * 내부 점도 경계 위의 closest boundary point를 기록한다.
 * rx <= 0 또는 ry <= 0인 empty ellipse는 ellipse center를 기록한다.
 * point가 ellipse 중심에 있으면 minor axis의 양의 방향 vertex를 기록한다.
 * rx > ry이면 (cx, cy + ry), 아니면 (cx + rx, cy)이다. rx === ry도 후자다.
 * major axis 위의 점이 evolute 안에 있으면 최근접점이 둘이다.
 * 이때 center보다 y가 큰 쪽을 기록한다. ry > rx이면 x가 큰 쪽을 기록한다.
 * 반복 수치 해법이다. 수렴 실패 시 마지막 반복 값을 사용한다.
 * out과 point가 같은 object일 때도 안전하게 동작한다.
 *
 * @param out closest boundary point를 기록할 점 객체
 * @param ellipse 기준 ellipse
 * @param point closest point를 계산할 기준 point
 * @param epsilon Newton-Raphson 수렴 판정 상대 임계값. 기본값: 1e-10
 */
export function closestPointInto<Out extends PointWritable>(
  out: Out,
  ellipse: Ellipse,
  point: Point,
  epsilon = DEFAULT_EPSILON
): Out {
  const rx = ellipse.rx;
  const ry = ellipse.ry;

  const cx = ellipse.cx;
  const cy = ellipse.cy;

  // empty ellipse는 center를 기록한다
  if (rx <= 0 || ry <= 0) {
    out.x = cx;
    out.y = cy;
    return out;
  }

  // point 좌표를 미리 읽어 aliasing 문제를 방지한다
  const px = point.x;
  const py = point.y;

  const dx = px - cx;
  const dy = py - cy;

  const theta = ellipseClosestPointAngle(dx, dy, rx, ry, epsilon);

  out.x = cx + Math.cos(theta) * rx;
  out.y = cy + Math.sin(theta) * ry;
  return out;
}
