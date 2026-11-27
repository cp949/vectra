import type { CircleWritable, Point } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * 세 점을 지나는 circumscribed circle을 out에 기록하고 out을 반환한다.
 *
 * collinear 또는 duplicate point로 분모가 0이면 false를 반환하고 out을 수정하지 않는다.
 * non-finite 좌표는 실패로 처리한다.
 * 출력 객체가 입력 점과 같아도 안전하다. 입력 좌표는 기록하기 전에 읽는다.
 *
 * @param out 결과를 기록할 원 객체
 * @param a 첫 번째 점
 * @param b 두 번째 점
 * @param c 세 번째 점
 */
export function fromThreePointsInto<Out extends CircleWritable>(out: Out, a: Point, b: Point, c: Point): Out | false {
  const ax = a.x;
  const ay = a.y;
  const bx = b.x;
  const by = b.y;
  const cx = c.x;
  const cy = c.y;

  if (
    !Number.isFinite(ax) ||
    !Number.isFinite(ay) ||
    !Number.isFinite(bx) ||
    !Number.isFinite(by) ||
    !Number.isFinite(cx) ||
    !Number.isFinite(cy)
  ) {
    return false;
  }

  const D = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (D === 0) return false;

  const a2 = ax * ax + ay * ay;
  const b2 = bx * bx + by * by;
  const c2 = cx * cx + cy * cy;
  const ux = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / D;
  const uy = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / D;

  out.cx = ux;
  out.cy = uy;
  out.r = hypot2(ax - ux, ay - uy);
  return out;
}
