import type { LengthOptions, XYInput } from '../types';
import { cubicSpeed } from './curve-speed.internal';
import { speedLength } from './speed-length.internal';

/**
 * cubic Bezier curve의 arc length를 Gauss-Legendre 수치 적분으로 계산하고 반환한다.
 *
 * t ∈ [0, 1] 구간을 segments로 분할하여 각 구간에서 5점 GL 적분을 수행한다.
 * global cache 없음. 호출마다 deterministic하게 계산한다.
 *
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param options 적분 옵션
 * @param options.segments 구간 분할 수. 기본값: 12
 * @returns arc length
 */
export function cubicLength(p0: XYInput, p1: XYInput, p2: XYInput, p3: XYInput, options?: LengthOptions): number {
  return speedLength(cubicSpeed(p0, p1, p2, p3), options);
}
