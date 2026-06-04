import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/** r/theta field에 극좌표를 기록할 수 있는 polar output. */
export interface PolarWritable {
  /** 기록 가능한 반지름 (항상 ≥ 0) */
  r: number;
  /** 기록 가능한 각도 (라디안, 범위: (-π, π]) */
  theta: number;
}

/**
 * XY 벡터를 극좌표로 변환해 out에 기록하고 out을 반환한다.
 *
 * r은 벡터의 길이 (항상 ≥ 0), theta는 x축으로부터의 각도 (라디안).
 * theta 범위: `Math.atan2`를 사용하므로 (-π, π].
 * zero-vector 입력 시 r = 0, theta = atan2(0, 0) = 0.
 * non-finite 입력(NaN, ±Infinity)은 그대로 pass-through한다. caller가 책임진다.
 *
 * @param out 결과를 기록할 polar writable output
 * @param v 극좌표로 변환할 XY 벡터
 */
export function toPolarInto<Out extends PolarWritable>(out: Out, v: XYInput): Out {
  const x = readX(v);
  const y = readY(v);
  const theta = Math.atan2(y, x);
  out.r = Math.hypot(x, y);
  out.theta = theta === -Math.PI ? Math.PI : theta;
  return out;
}
