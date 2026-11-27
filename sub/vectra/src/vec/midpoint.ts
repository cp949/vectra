import { readX, readY } from '../internal/xy';
import { midpoint as midpointImpl } from '../interpolation/midpoint';
import type { XYInput } from '../types';

/**
 * a와 b의 중점 벡터를 새 object로 반환한다.
 *
 * `interpolation.midpoint`와 동일한 계산 및 정책을 사용하는 vec 도메인 alias다.
 * a, b의 x/y는 finite number여야 한다.
 *
 * @param a 중점을 구할 첫 번째 벡터
 * @param b 중점을 구할 두 번째 벡터
 */
export function midpoint(a: XYInput, b: XYInput): { x: number; y: number } {
  // v2-migration: vec의 tuple 입력 계약을 유지한다.
  const aPoint = { x: readX(a), y: readY(a) };
  const bPoint = { x: readX(b), y: readY(b) };
  return midpointImpl(aPoint, bPoint);
}
