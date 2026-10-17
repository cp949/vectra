import type { LengthOptions, TAtLengthOptions } from '../types';
import type { CurveSpeed } from './curve-speed.internal';

/**
 * 5점 Gauss-Legendre 적분 node와 weight.
 * 구간 [-1, 1] 기준이다. 곡선별 adapter(`curve-speed.internal`)가 가져다 쓴다.
 */
export const GL5_NODES = [0, 0.5384693101056831, -0.5384693101056831, 0.906179845938664, -0.906179845938664] as const;
export const GL5_WEIGHTS = [
  0.5688888888888889, 0.47862867049936647, 0.47862867049936647, 0.23692688505618908, 0.23692688505618908,
] as const;

/**
 * 곡선 전체 구간 [from, to]의 arc length를 반환한다.
 *
 * from === to이면 0이다.
 * 적분 합의 부호는 (to - from)의 부호를 따른다. 길이는 양수가 정의이므로 절댓값을 취한다.
 *
 * @param curve 곡선 적분기
 * @param options 적분 옵션. segments 기본값: 12
 */
export function speedLength(curve: CurveSpeed, options?: LengthOptions): number {
  if (curve.from === curve.to) return 0;
  return Math.abs(curve.integrate(curve.from, curve.to, options?.segments ?? 12));
}

/**
 * 곡선의 t=0부터 t까지의 arc length를 반환한다.
 *
 * t <= 0이면 0이다. 그다음 from === to이면 0이다(NaN t도 0).
 * t는 1로 clamp한다. 구간 끝은 from + (to - from) * t이다.
 *
 * @param curve 곡선 적분기
 * @param t 정규화 파라미터
 * @param options 적분 옵션. segments 기본값: 12
 */
export function speedLengthAtT(curve: CurveSpeed, t: number, options?: LengthOptions): number {
  if (t <= 0) return 0;
  if (curve.from === curve.to) return 0;
  const tClamped = t >= 1 ? 1 : t;
  const end = curve.from + (curve.to - curve.from) * tClamped;
  return Math.abs(curve.integrate(curve.from, end, options?.segments ?? 12));
}

/**
 * arc length distance에 해당하는 정규화 파라미터 t를 이진 탐색으로 반환한다.
 *
 * 총길이가 0이거나 distance <= 0이면 0, distance >= 총길이이면 1이다.
 * 총길이는 speedLengthAtT(curve, 1)로 구한다. arc에서 from + (to - from) * 1이
 * to와 비트 단위로 다를 수 있어 speedLength와 값이 갈릴 수 있다.
 *
 * @param curve 곡선 적분기
 * @param distance 목표 arc length
 * @param options 탐색 옵션. tolerance 기본값: 1e-8, maxIterations 기본값: 64, segments 기본값: 12
 */
export function speedTAtLength(curve: CurveSpeed, distance: number, options?: TAtLengthOptions): number {
  const tolerance = options?.tolerance ?? 1e-8;
  const maxIterations = options?.maxIterations ?? 64;

  const totalLength = speedLengthAtT(curve, 1, options);

  if (totalLength === 0) return 0;
  if (distance <= 0) return 0;
  if (distance >= totalLength) return 1;

  let lo = 0;
  let hi = 1;

  for (let i = 0; i < maxIterations; i++) {
    if (hi - lo <= tolerance) break;
    const mid = (lo + hi) * 0.5;
    if (speedLengthAtT(curve, mid, options) < distance) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return (lo + hi) * 0.5;
}
