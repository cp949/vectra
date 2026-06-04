import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * 벡터의 길이가 epsilon 이하이면 true를 반환한다.
 *
 * 기본 epsilon은 1e-9이다.
 * NaN을 포함하는 입력은 `false`를 반환한다.
 *
 * @param input zero length 여부를 검사할 벡터
 * @param epsilon 허용할 절대 오차
 */
export function isZero(input: XYInput, epsilon = 1e-9): boolean {
  return Math.hypot(readX(input), readY(input)) <= epsilon;
}
