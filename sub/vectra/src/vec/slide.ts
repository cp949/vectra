import type { XYInput, XYObjectWritable } from '../types';
import { slideInto } from './slide-into';

/**
 * vector에서 normal 성분을 제거한 벡터를 새 object로 반환한다.
 *
 * collision slide helper. `rejectFrom`과 같은 계산 정책을 사용한다:
 * `vector - dot(vector, normal) / lengthSq(normal) * normal`. normal은 임의 길이다.
 * `lengthSq(normal) === 0`이면 vector를 그대로 복사한 새 object를 반환한다.
 * non-finite 입력은 검증 없이 pass through한다.
 *
 * @param vector 슬라이드할 벡터
 * @param normal 충돌 표면 법선 벡터 (임의 길이)
 */
export function slide(vector: XYInput, normal: XYInput): XYObjectWritable {
  return slideInto({ x: 0, y: 0 }, vector, normal);
}
