import type { XYInput, XYObjectWritable } from '../types';
import { multiplyInto } from './multiply-into';

/**
 * a와 b의 각 성분을 곱한 벡터를 새 object로 반환한다.
 *
 * @param a 곱할 첫 번째 벡터
 * @param b 곱할 두 번째 벡터
 */
export function multiply(a: XYInput, b: XYInput): XYObjectWritable {
  return multiplyInto({ x: 0, y: 0 }, a, b);
}
