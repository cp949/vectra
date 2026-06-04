import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * a와 b의 각 성분이 `===`로 같으면 true를 반환한다.
 *
 * @param a 비교할 첫 번째 벡터
 * @param b 비교할 두 번째 벡터
 */
export function equals(a: XYInput, b: XYInput): boolean {
  return readX(a) === readX(b) && readY(a) === readY(b);
}
