import type { XYInput, XYObjectWritable } from '../types';
import { setLengthInto } from './set-length-into';

/**
 * vector를 정규화한 뒤 targetLength를 곱한 벡터를 새 `{ x, y }` object로 반환한다.
 *
 * zero vector는 방향 없이 `{ x: 0, y: 0 }`을 반환한다.
 * caller는 targetLength가 finite non-negative임을 보장해야 한다.
 * precondition 위반 결과는 정의되지 않는다.
 * non-finite 입력은 검증 없이 JavaScript 연산 결과 그대로 흐른다.
 *
 * @param vector 길이를 설정할 벡터
 * @param targetLength 설정할 길이 (finite non-negative 전제)
 */
export function setLength(vector: XYInput, targetLength: number): XYObjectWritable {
  return setLengthInto({ x: 0, y: 0 }, vector, targetLength);
}
