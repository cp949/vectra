import type { TAtLengthOptions } from '../types';
import type { QuadraticCurve } from '../types/flat-shapes.internal';
import { quadraticSpeed } from './curve-speed.internal';
import { speedTAtLength } from './speed-length.internal';

/**
 * quadratic Bezier curve에서 arc length distance에 해당하는 파라미터 t를 반환한다.
 *
 * distance를 [0, totalLength]로 clamp한다. 반환 t는 항상 [0, 1]이다.
 * zero-length curve는 distance와 무관하게 0을 반환한다.
 * 이진 탐색으로 수렴하며, 수렴하지 않으면 마지막 추정값을 반환한다.
 *
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param distance 목표 arc length
 * @param options 탐색 옵션. 생략하면 `{ segments: 12, tolerance: 1e-8, maxIterations: 64 }`를 쓴다.
 * @param options.segments 적분 구간 분할 수
 * @param options.tolerance 이진 탐색 수렴 threshold
 * @param options.maxIterations 이진 탐색 최대 반복 횟수
 */
export function quadraticTAtLength(
  curve: QuadraticCurve,
  distance: number,
  options?: Required<TAtLengthOptions>
): number {
  return speedTAtLength(quadraticSpeed(curve), distance, options);
}
