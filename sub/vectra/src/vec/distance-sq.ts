import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * a와 b 사이 Euclidean 거리의 제곱을 반환한다.
 *
 * @param a 거리를 측정할 첫 번째 점
 * @param b 거리를 측정할 두 번째 점
 */
export function distanceSq(a: XYInput, b: XYInput): number {
  const dx = readX(b) - readX(a);
  const dy = readY(b) - readY(a);

  return dx * dx + dy * dy;
}
