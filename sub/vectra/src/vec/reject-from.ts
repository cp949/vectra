import type { XYInput, XYObjectWritable } from '../types';
import { rejectFromInto } from './reject-from-into';

/**
 * vector에서 basis 방향 성분을 제거한 벡터를 새 object로 반환한다.
 *
 * `vector - dot(vector, basis) / lengthSq(basis) * basis`. basis는 임의 길이다.
 * `lengthSq(basis) === 0`이면 vector를 그대로 복사한 새 object를 반환한다.
 * non-finite 입력은 검증 없이 pass through한다.
 *
 * @param vector 분리할 벡터
 * @param basis 제거할 방향 벡터 (임의 길이)
 */
export function rejectFrom(vector: XYInput, basis: XYInput): XYObjectWritable {
  return rejectFromInto({ x: 0, y: 0 }, vector, basis);
}
