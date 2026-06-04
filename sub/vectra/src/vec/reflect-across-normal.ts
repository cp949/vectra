import type { XYInput, XYObjectWritable } from '../types';
import { reflectAcrossNormalInto } from './reflect-across-normal-into';

/**
 * vector를 unit normal에 대해 반사한 벡터를 새 object로 반환한다.
 *
 * normal은 unit vector 전제 (정규화 없음).
 *
 * @param vector 반사할 벡터
 * @param normal 반사 기준 법선 벡터 (unit vector 전제)
 */
export function reflectAcrossNormal(vector: XYInput, normal: XYInput): XYObjectWritable {
  return reflectAcrossNormalInto({ x: 0, y: 0 }, vector, normal);
}
