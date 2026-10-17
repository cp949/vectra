import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY, writeXY } from '../internal/xy';
import type { EllipseLike, XYInput, XYWritable } from '../types';
import { ellipseClosestPointAngle } from './ellipse-closest-point.internal';

/** Newton-Raphson 수렴 판정 기본 epsilon */
const DEFAULT_EPSILON = 1e-10;

/**
 * ellipse boundary에서 point에 가장 가까운 점을 out에 기록하고 out을 반환한다.
 *
 * 거리는 Euclidean 거리다. 기록한 점에서 point로 향하는 선은 boundary에 수직이다.
 * 내부 점도 경계 위의 closest boundary point를 기록한다.
 * radiusX <= 0 또는 radiusY <= 0인 empty ellipse는 ellipse center를 기록한다.
 * point === ellipse center인 경우 minor axis의 양의 방향 vertex를 기록한다.
 * radiusX > radiusY이면 (cx, cy + radiusY), 아니면 (cx + radiusX, cy)이다. radiusX === radiusY도 후자다.
 * major axis 위의 점이 evolute 안에 있으면 최근접점이 둘이다.
 * 이때 center보다 y가 큰 쪽을 기록한다. radiusY > radiusX이면 x가 큰 쪽을 기록한다.
 * 반복 수치 해법이다. 수렴 실패 시 마지막 반복 값을 사용한다.
 * out과 point가 같은 object일 때도 안전하게 동작한다.
 *
 * @param out closest boundary point를 기록할 writable output
 * @param ellipse 기준 ellipse
 * @param point closest point를 계산할 기준 point
 * @param epsilon Newton-Raphson 수렴 판정 상대 임계값. 기본값: 1e-10
 */
export function closestPointInto<Out extends XYWritable>(
  out: Out,
  ellipse: EllipseLike,
  point: XYInput,
  epsilon = DEFAULT_EPSILON
): Out {
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);

  const center = readEllipseCenter(ellipse);
  const cx = readX(center);
  const cy = readY(center);

  // empty ellipse는 center를 기록한다
  if (rx <= 0 || ry <= 0) return writeXY(out, cx, cy);

  // point 좌표를 미리 읽어 aliasing 문제를 방지한다
  const px = readX(point);
  const py = readY(point);

  const dx = px - cx;
  const dy = py - cy;

  const theta = ellipseClosestPointAngle(dx, dy, rx, ry, epsilon);

  return writeXY(out, cx + Math.cos(theta) * rx, cy + Math.sin(theta) * ry);
}
