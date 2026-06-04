import type { XYInput, XYObjectWritable } from '../types';
import { clampLengthInto } from './clamp-length-into';

/**
 * vector 길이를 [minLength, maxLength] 범위로 clamp한 벡터를 새 `{ x, y }` object로 반환한다.
 *
 * zero vector는 방향 없이 `{ x: 0, y: 0 }`을 반환한다.
 * caller는 `0 <= minLength <= maxLength`이고 두 값이 finite임을 보장해야 한다.
 * precondition 위반 결과는 정의되지 않는다.
 * non-finite 입력은 검증 없이 JavaScript 연산 결과 그대로 흐른다.
 *
 * @param vector 길이를 clamp할 벡터
 * @param minLength 최소 길이 (0 이상, maxLength 이하, finite 전제)
 * @param maxLength 최대 길이 (minLength 이상, finite 전제)
 */
export function clampLength(vector: XYInput, minLength: number, maxLength: number): XYObjectWritable {
  return clampLengthInto({ x: 0, y: 0 }, vector, minLength, maxLength);
}
