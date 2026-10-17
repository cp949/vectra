import type { LengthOptions, XYInput } from '../types';
import { quadraticSpeed } from './curve-speed.internal';
import { speedLength } from './speed-length.internal';

/**
 * quadratic Bezier curve의 arc length를 Gauss-Legendre 수치 적분으로 계산하고 반환한다.
 *
 * t ∈ [0, 1] 구간을 segments로 분할하여 각 구간에서 5점 GL 적분을 수행한다.
 *
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param options 적분 옵션
 * @param options.segments 구간 분할 수. 기본값: 12
 */
export function quadraticLength(p0: XYInput, p1: XYInput, p2: XYInput, options?: LengthOptions): number {
  return speedLength(quadraticSpeed(p0, p1, p2), options);
}
