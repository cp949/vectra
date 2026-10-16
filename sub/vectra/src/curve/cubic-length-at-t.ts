import type { LengthOptions, XYInput } from '../types';
import { cubicSpeed } from './curve-speed.internal';
import { speedLengthAtT } from './speed-length.internal';

/**
 * cubic Bezier curve의 t=0부터 t까지의 arc length를 반환한다.
 *
 * t를 [0, 1]로 clamp한다. t <= 0이면 0, t >= 1이면 전체 length를 반환한다.
 * 구간 적분은 Gauss-Legendre 5점 적분을 사용한다.
 *
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param t 파라미터 (clamp됨)
 * @param options 적분 옵션
 * @param options.segments 구간 분할 수. 기본값: 12
 */
export function cubicLengthAtT(
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  t: number,
  options?: LengthOptions
): number {
  return speedLengthAtT(cubicSpeed(p0, p1, p2, p3), t, options);
}
