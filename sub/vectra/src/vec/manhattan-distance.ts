import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * 두 점 a, b 사이의 Manhattan 거리(|ax - bx| + |ay - by|)를 반환한다.
 *
 * @param a 거리를 측정할 첫 번째 점
 * @param b 거리를 측정할 두 번째 점
 */
export function manhattanDistance(a: XYInput, b: XYInput): number {
  return Math.abs(readX(a) - readX(b)) + Math.abs(readY(a) - readY(b));
}
