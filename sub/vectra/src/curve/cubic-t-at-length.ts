import type { TAtLengthOptions, XYInput } from '../types';
import { cubicSpeed } from './curve-speed.internal';
import { speedTAtLength } from './speed-length.internal';

/**
 * cubic Bezier curve에서 arc length distance에 해당하는 파라미터 t를 반환한다.
 *
 * distance를 [0, totalLength]로 clamp한다. 반환 t는 항상 [0, 1]이다.
 * zero-length curve는 distance와 무관하게 0을 반환한다.
 * 이진 탐색으로 수렴하며, 수렴하지 않으면 마지막 추정값을 반환한다.
 *
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param distance 목표 arc length
 * @param options 탐색 옵션
 * @param options.segments 적분 구간 분할 수. 기본값: 12
 * @param options.tolerance 이진 탐색 수렴 threshold. 기본값: 1e-8
 * @param options.maxIterations 이진 탐색 최대 반복 횟수. 기본값: 64
 */
export function cubicTAtLength(
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  distance: number,
  options?: TAtLengthOptions
): number {
  return speedTAtLength(cubicSpeed(p0, p1, p2, p3), distance, options);
}
