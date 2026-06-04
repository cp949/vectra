import type { XYInput, XYObjectWritable } from '../types';
import { minInto } from './min-into';

/**
 * a와 b의 각 성분 중 더 작은 값으로 구성된 벡터를 새 object로 반환한다.
 *
 * NaN, Infinity, -Infinity 입력은 Math.min 정책을 따른다.
 *
 * @param a 첫 번째 입력 벡터
 * @param b 두 번째 입력 벡터
 */
export function min(a: XYInput, b: XYInput): XYObjectWritable {
  return minInto({ x: 0, y: 0 }, a, b);
}
