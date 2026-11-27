import type { Ellipse, Point, PointWritable } from '../types/flat-shapes.internal';
import { ellipseClosestPointAngle } from './ellipse-closest-point.internal';

/** Newton-Raphson 수렴 판정 기본 epsilon */
const DEFAULT_EPSILON = 1e-10;

/**
 * point를 ellipse boundary에 Euclidean closest projection으로 투영해 out에 기록하고 out을 반환한다.
 *
 * 내부 점도 boundary closest projection을 기록한다 (`closestPointInto`와 동일 semantics).
 * empty ellipse(`rx <= 0 || ry <= 0`)는 center를 기록한다.
 * point가 ellipse 중심에 있으면 minor axis의 양의 방향 vertex를 기록한다.
 * `rx > ry`이면 `(cx, cy + ry)`, 아니면 `(cx + rx, cy)`이다. `rx === ry`도 후자다.
 * major axis 위의 점이 evolute 안에 있으면 최근접점이 둘이다. center보다 y가 큰 쪽을 기록한다.
 * `ry > rx`이면 x가 큰 쪽을 기록한다.
 * 반복 수치 해법이다. 수렴 실패 시 마지막 반복 값을 사용한다.
 * `out`과 `point`가 같은 object여도 안전하다.
 *
 * @param out projection 결과를 기록할 객체
 * @param ellipse projection 기준 ellipse
 * @param point projection할 기준 point
 * @param epsilon Newton-Raphson 수렴 판정 상대 임계값. 기본값: 1e-10
 */
export function projectPointInto<Out extends PointWritable>(
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

  // aliasing 안전: point 좌표를 미리 읽는다
  const px = point.x;
  const py = point.y;

  const theta = ellipseClosestPointAngle(px - cx, py - cy, rx, ry, epsilon);
  out.x = cx + Math.cos(theta) * rx;
  out.y = cy + Math.sin(theta) * ry;
  return out;
}
