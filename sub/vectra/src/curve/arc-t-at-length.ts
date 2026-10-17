import type { CenterArcLike, TAtLengthOptions } from '../types';
import { centerArcSpeed } from './curve-speed.internal';
import { speedTAtLength } from './speed-length.internal';

/**
 * center form arc에서 arc length distance에 해당하는 파라미터 t를 반환한다.
 *
 * distance를 [0, totalLength]로 clamp한다. 반환 t는 항상 [0, 1]이다.
 * degenerate arc 또는 zero-sweep arc는 항상 0을 반환한다.
 * 이진 탐색으로 수렴하며, 수렴하지 않으면 마지막 추정값을 반환한다.
 *
 * @param centerArc center form arc input
 * @param distance 목표 arc length
 * @param options 탐색 옵션
 * @param options.segments θ 구간 분할 수. 기본값: 12
 * @param options.tolerance 이진 탐색 수렴 threshold. 기본값: 1e-8
 * @param options.maxIterations 이진 탐색 최대 반복 횟수. 기본값: 64
 */
export function arcTAtLength(centerArc: CenterArcLike, distance: number, options?: TAtLengthOptions): number {
  return speedTAtLength(centerArcSpeed(centerArc), distance, options);
}
