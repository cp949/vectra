import type { LengthOptions } from '../types';
import type { CubicCurve } from '../types/flat-shapes.internal';
import { cubicSpeed } from './curve-speed.internal';
import { speedLength } from './speed-length.internal';

/**
 * cubic Bezier curve의 arc length를 Gauss-Legendre 수치 적분으로 계산하고 반환한다.
 *
 * t ∈ [0, 1] 구간을 segments로 분할하여 각 구간에서 5점 GL 적분을 수행한다.
 * global cache 없음. 호출마다 deterministic하게 계산한다.
 *
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param options 적분 옵션
 * @param options.segments 구간 분할 수. 기본값: 12
 * @returns arc length
 */
export function cubicLength(curve: CubicCurve, options?: Required<LengthOptions>): number {
  return speedLength(cubicSpeed(curve), options);
}
