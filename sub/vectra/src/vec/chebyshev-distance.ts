import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * a와 b 사이의 Chebyshev 거리(L∞ 거리)를 반환한다.
 *
 * `Math.max(|a.x - b.x|, |a.y - b.y|)`와 같다.
 *
 * @param a 첫 번째 점
 * @param b 두 번째 점
 */
export function chebyshevDistance(a: XYInput, b: XYInput): number {
  return Math.max(Math.abs(readX(a) - readX(b)), Math.abs(readY(a) - readY(b)));
}
