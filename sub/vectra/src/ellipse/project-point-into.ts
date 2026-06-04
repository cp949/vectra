import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY, writeXY } from '../internal/xy';
import type { EllipseLike, XYInput, XYWritable } from '../types';
import { ellipseClosestPointAngle } from './ellipse-closest-point.internal';

/** Newton-Raphson 수렴 판정 기본 epsilon */
const DEFAULT_EPSILON = 1e-10;

/**
 * point를 ellipse boundary에 Euclidean closest projection으로 투영해 out에 기록하고 out을 반환한다.
 *
 * 내부 점도 boundary closest projection을 기록한다 (`closestPointInto`와 동일 semantics).
 * empty ellipse(`radiusX <= 0 || radiusY <= 0`)는 center를 기록한다.
 * `point === ellipse.center` tie-break는 `(cx + radiusX, cy)`이다.
 * 반복 수치 해법이다. 수렴 실패 시 마지막 반복 값을 사용한다.
 * `out`과 `point`가 같은 object여도 안전하다.
 *
 * @param out projection 결과를 기록할 writable output
 * @param ellipse projection 기준 ellipse
 * @param point projection할 기준 point
 * @param epsilon Newton-Raphson 수렴 판정 임계값. 기본값: 1e-10
 */
export function projectPointInto<Out extends XYWritable>(
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

  // aliasing 안전: point 좌표를 미리 읽는다
  const px = readX(point);
  const py = readY(point);

  const theta = ellipseClosestPointAngle(px - cx, py - cy, rx, ry, epsilon);
  return writeXY(out, cx + Math.cos(theta) * rx, cy + Math.sin(theta) * ry);
}
