import type { XYInput, XYObjectWritable } from '../types';
import { scaleInto } from './scale-into';

/**
 * input에 scalar를 곱한 벡터를 새 object로 반환한다.
 *
 * @param input 배율을 적용할 입력 벡터
 * @param scalar 각 성분에 곱할 스칼라 값
 */
export function scale(input: XYInput, scalar: number): XYObjectWritable {
  return scaleInto({ x: 0, y: 0 }, input, scalar);
}
