import type { XYInput, XYObjectWritable } from '../types';
import { divideInto } from './divide-into';

/**
 * a의 각 성분을 b의 각 성분으로 나눈 벡터를 새 object로 반환한다.
 *
 * b.x 또는 b.y가 0이면 해당 성분은 Infinity 또는 NaN이 될 수 있다. 유효성 검사 없이 raw division을 수행한다.
 *
 * @param a 피제수 벡터
 * @param b 제수 벡터. 성분이 0이면 Infinity 또는 NaN이 나올 수 있다
 */
export function divide(a: XYInput, b: XYInput): XYObjectWritable {
  return divideInto({ x: 0, y: 0 }, a, b);
}
