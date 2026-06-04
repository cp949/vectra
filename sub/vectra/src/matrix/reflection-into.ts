import type { MatrixWritable } from '../types';

/**
 * 원점을 통과하는 축에 대한 반사 행렬을 out에 기록하고 out을 반환한다.
 *
 * axisAngle은 반사 축의 방향각 (radian)이다.
 * 반사 축은 항상 원점을 통과하는 직선을 가정한다.
 * 공식: `a = cos(2θ), b = sin(2θ), c = sin(2θ), d = -cos(2θ), tx = 0, ty = 0`.
 *
 * axisAngle이 NaN 또는 Infinity이면 결과가 정의되지 않는다 (caller 책임).
 *
 * @param out 반사 행렬 component를 기록할 writable output
 * @param axisAngle 반사 축 방향각 (radian). 원점을 통과하는 직선의 방향.
 */
export function reflectionInto<Out extends MatrixWritable>(out: Out, axisAngle: number): Out {
  const cos2 = Math.cos(2 * axisAngle);
  const sin2 = Math.sin(2 * axisAngle);
  out.a = cos2;
  out.b = sin2;
  out.c = sin2;
  out.d = -cos2;
  out.tx = 0;
  out.ty = 0;
  return out;
}
