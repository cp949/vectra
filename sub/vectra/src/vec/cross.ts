import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * a와 b의 2D cross product를 z 성분 스칼라로 반환한다.
 *
 * @param a cross product의 첫 번째 벡터
 * @param b cross product의 두 번째 벡터
 */
export function cross(a: XYInput, b: XYInput): number {
  return readX(a) * readY(b) - readY(a) * readX(b);
}
