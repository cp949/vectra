import { assertFiniteT } from './easing.internal';

/**
 * 지수 감쇠 step 형태의 expStep scalar shaping 함수다.
 *
 * 수식: Math.exp(-k * t ** n)
 * t === 0이면 1. t 증가에 따라 0으로 감쇠한다.
 * 음수 t와 fractional n 조합에서 NaN이 발생할 수 있다 (clamp 안 함).
 * t는 finite number여야 한다.
 * k는 finite positive number(> 0)여야 한다. 위반 시 RangeError.
 * n은 finite positive number(> 0)여야 한다. 위반 시 RangeError.
 *
 * @param t easing progress (보통 [0, 1])
 * @param k 감쇠 속도. finite positive (> 0). 클수록 빠르게 감쇠한다.
 * @param n 지수 형태 제어. finite positive (> 0). 클수록 감쇠 시작이 늦고 급격해진다.
 */
export function expStep(t: number, k: number, n: number): number {
  assertFiniteT(t);
  if (!Number.isFinite(k) || k <= 0) {
    throw new RangeError('easing expStep k must be a finite positive number (> 0)');
  }
  if (!Number.isFinite(n) || n <= 0) {
    throw new RangeError('easing expStep n must be a finite positive number (> 0)');
  }
  return Math.exp(-k * t ** n);
}
