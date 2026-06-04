import type { XYInput, XYObjectWritable } from '../types';
import { reflectInto } from './reflect-into';

/**
 * vector를 normal에 대해 반사한 벡터를 새 object로 반환한다.
 *
 * `vector - 2 * dot(vector, normal) / lengthSq(normal) * normal`. normal은 임의 길이다.
 * `lengthSq(normal) === 0`이면 vector를 그대로 복사한 새 object를 반환한다.
 * non-finite 입력은 검증 없이 pass through한다.
 *
 * @param vector 반사할 벡터
 * @param normal 반사 기준 법선 벡터 (임의 길이)
 */
export function reflect(vector: XYInput, normal: XYInput): XYObjectWritable {
  return reflectInto({ x: 0, y: 0 }, vector, normal);
}
