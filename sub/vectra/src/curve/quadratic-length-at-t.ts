import type { LengthOptions } from '../types';
import type { QuadraticCurve } from '../types/flat-shapes.internal';
import { quadraticSpeed } from './curve-speed.internal';
import { speedLengthAtT } from './speed-length.internal';

/**
 * quadratic Bezier curve의 t=0부터 t까지의 arc length를 반환한다.
 *
 * t를 [0, 1]로 clamp한다. t <= 0이면 0, t >= 1이면 전체 length를 반환한다.
 * 구간 적분은 Gauss-Legendre 5점 적분을 사용한다.
 *
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param t 파라미터 (clamp됨)
 * @param options 적분 옵션. 생략하면 `{ segments: 12 }`를 쓴다.
 * @param options.segments 구간 분할 수
 */
export function quadraticLengthAtT(curve: QuadraticCurve, t: number, options?: Required<LengthOptions>): number {
  return speedLengthAtT(quadraticSpeed(curve), t, options);
}
