import { readX, readY, writeXY } from '../internal/xy';
import type { CircleWritable, XYInput, XYWritable } from '../types';

/**
 * 세 점을 지나는 circumscribed circle을 out에 기록하고 out을 반환한다.
 *
 * collinear 또는 duplicate point로 분모가 0이면 false를 반환하고 out을 수정하지 않는다.
 * non-finite 좌표는 실패로 처리한다.
 * out.center가 입력 point와 alias되어도 안전하다. 계산에 필요한 좌표는 쓰기 전에 local 변수로 읽는다.
 *
 * @param out circle을 기록할 writable output
 * @param a 첫 번째 점
 * @param b 두 번째 점
 * @param c 세 번째 점
 */
export function fromThreePointsInto<Out extends CircleWritable<XYWritable>>(
  out: Out,
  a: XYInput,
  b: XYInput,
  c: XYInput
): Out | false {
  const ax = readX(a);
  const ay = readY(a);
  const bx = readX(b);
  const by = readY(b);
  const cx = readX(c);
  const cy = readY(c);

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

  writeXY(out.center, ux, uy);
  out.radius = Math.hypot(ax - ux, ay - uy);
  return out;
}
