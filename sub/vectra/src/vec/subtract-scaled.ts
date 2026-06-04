import type { XYInput, XYObjectWritable } from '../types';
import { subtractScaledInto } from './subtract-scaled-into';

/**
 * a에서 b * scalar를 뺀 벡터를 새 object로 반환한다.
 *
 * b를 먼저 scalar로 곱한 뒤 a에서 뺀다.
 *
 * @param a 기준 벡터
 * @param b scalar를 곱한 뒤 뺄 벡터
 * @param scalar b에 곱할 스칼라값
 */
export function subtractScaled(a: XYInput, b: XYInput, scalar: number): XYObjectWritable {
  return subtractScaledInto({ x: 0, y: 0 }, a, b, scalar);
}
