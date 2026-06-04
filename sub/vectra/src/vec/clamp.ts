import type { XYInput, XYObjectWritable } from '../types';
import { clampInto } from './clamp-into';

/**
 * input의 각 성분을 [min, max] 범위로 clamp한 벡터를 새 object로 반환한다.
 *
 * NaN, Infinity, -Infinity 입력은 Math.min/Math.max 정책을 따른다.
 *
 * caller가 min <= max 순서로 전달해야 한다. min > max이면 결과는 정의되지 않는다.
 *
 * @param input clamp할 입력 벡터
 * @param min 각 성분의 하한 벡터
 * @param max 각 성분의 상한 벡터
 */
export function clamp(input: XYInput, min: XYInput, max: XYInput): XYObjectWritable {
  return clampInto({ x: 0, y: 0 }, input, min, max);
}
