import type { CenterArcLike, LengthOptions } from '../types';
import { centerArcSpeed } from './curve-speed.internal';
import { speedLength } from './speed-length.internal';

/**
 * center form arc의 arc length를 Gauss-Legendre 수치 적분으로 계산하고 반환한다.
 *
 * θ 구간 [startAngle, endAngle]을 segments로 분할해 각 구간에서 5점 GL 적분을 수행한다.
 * degenerate(rx <= 0 또는 ry <= 0) 또는 zero-sweep arc는 0을 반환한다.
 *
 * @param centerArc center form arc input
 * @param options 적분 옵션
 * @param options.segments θ 구간 분할 수. 기본값: 12
 * @returns arc length
 */
export function arcLength(centerArc: CenterArcLike, options?: LengthOptions): number {
  return speedLength(centerArcSpeed(centerArc), options);
}
