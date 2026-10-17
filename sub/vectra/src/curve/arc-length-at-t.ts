import type { CenterArcLike, LengthOptions } from '../types';
import { centerArcSpeed } from './curve-speed.internal';
import { speedLengthAtT } from './speed-length.internal';

/**
 * center form arc의 t=0부터 t까지의 arc length를 반환한다.
 *
 * t를 [0, 1]로 clamp한다. t <= 0이면 0을 반환한다.
 * degenerate arc(rx <= 0 또는 ry <= 0) 또는 zero-sweep arc는 0을 반환한다.
 * 구간 적분은 Gauss-Legendre 5점 적분을 사용한다.
 *
 * @param centerArc center form arc input
 * @param t 파라미터 (clamp됨)
 * @param options 적분 옵션
 * @param options.segments θ 구간 분할 수. 기본값: 12
 */
export function arcLengthAtT(centerArc: CenterArcLike, t: number, options?: LengthOptions): number {
  return speedLengthAtT(centerArcSpeed(centerArc), t, options);
}
