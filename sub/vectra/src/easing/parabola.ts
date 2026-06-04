import { assertFiniteT } from './easing.internal';

/**
 * 포물선 형태의 parabola scalar shaping 함수다.
 *
 * 수식: Math.pow(4 * t * (1 - t), k)
 * t === 0 → 0, t === 1 → 0, t === 0.5 → 1 (정수 k 기준).
 * [0, 1] 밖 t 입력과 fractional k 조합에서 NaN이 발생할 수 있다 (clamp 안 함).
 * t는 finite number여야 한다.
 * k는 finite positive number(> 0)여야 한다. 위반 시 RangeError.
 *
 * @param t easing progress (보통 [0, 1])
 * @param k 곡선 날카로움. finite positive (> 0). 클수록 peak가 좁아진다.
 */
export function parabola(t: number, k: number): number {
  assertFiniteT(t);
  if (!Number.isFinite(k) || k <= 0) {
    throw new RangeError('easing parabola k must be a finite positive number (> 0)');
  }
  return (4 * t * (1 - t)) ** k;
}
