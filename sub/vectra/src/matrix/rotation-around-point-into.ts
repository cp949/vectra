import { readX, readY } from '../internal/xy';
import type { MatrixWritable, XYInput } from '../types';

/**
 * point를 중심으로 rotation하는 matrix를 out에 기록하고 out을 반환한다.
 *
 * `T(point) * R(angle) * T(-point)`를 직접 전개해 기록한다.
 * 결과: `a=cos, b=sin, c=-sin, d=cos, tx=px*(1-cos)+py*sin, ty=py*(1-cos)-px*sin`.
 *
 * @param out transform matrix를 기록할 writable output
 * @param point rotation 중심점
 * @param angle rotation angle (radian)
 */
export function rotationAroundPointInto<Out extends MatrixWritable>(out: Out, point: XYInput, angle: number): Out {
  const px = readX(point);
  const py = readY(point);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  out.a = cosA;
  out.b = sinA;
  out.c = -sinA;
  out.d = cosA;
  out.tx = px * (1 - cosA) + py * sinA;
  out.ty = py * (1 - cosA) - px * sinA;
  return out;
}
