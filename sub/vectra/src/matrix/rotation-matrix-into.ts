import type { MatrixWritable } from '../types';

/**
 * identity 기반 rotation matrix를 out에 기록하고 out을 반환한다.
 *
 * 기존 matrix를 합성하지 않고, angle로부터 rotation-only component matrix를 새로 생성한다. angle은 radian이다.
 * 회전 중심은 origin이다.
 *
 * NaN/Infinity angle은 검증하지 않는다. `Math.cos`/`Math.sin` 산술 결과를 그대로 기록한다 (caller 책임).
 *
 * @param out rotation component를 기록할 writable output
 * @param angle 생성할 rotation angle (radian)
 */
export function rotationMatrixInto<Out extends MatrixWritable>(out: Out, angle: number): Out {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  out.a = cosA;
  out.b = sinA;
  out.c = -sinA;
  out.d = cosA;
  out.tx = 0;
  out.ty = 0;
  return out;
}
