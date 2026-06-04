import type { XYInput } from '../types';
import { midpointInto } from './midpoint-into';

/**
 * a와 b의 중점을 새 object로 반환한다.
 *
 * `lerpPoint(a, b, 0.5)`와 동일한 결과다.
 * a, b의 x/y는 finite number여야 한다.
 *
 * @param a 중점을 구할 첫 번째 좌표
 * @param b 중점을 구할 두 번째 좌표
 */
export function midpoint(a: XYInput, b: XYInput): { x: number; y: number } {
  return midpointInto({ x: 0, y: 0 }, a, b);
}
