import { assertFiniteT } from './easing.internal';

/**
 * impulse scalar shaping 함수다.
 *
 * 수식: h = k * t, h * Math.exp(1 - h)
 * t = 1/k에서 peak 1에 도달하고, 이후 감쇠한다.
 * k * t가 Infinity가 되면 JavaScript 수식 결과를 따른다 (clamp 안 함).
 * t는 finite number여야 한다.
 * k는 finite positive number(> 0)여야 한다. 위반 시 RangeError.
 *
 * @param t easing progress (보통 [0, 1])
 * @param k 감쇠 속도 제어. finite positive (> 0). 클수록 peak가 t=0 근처에서 빠르게 발생.
 */
export function impulse(t: number, k: number): number {
  assertFiniteT(t);
  if (!Number.isFinite(k) || k <= 0) {
    throw new RangeError('easing impulse k must be a finite positive number (> 0)');
  }
  const h = k * t;
  return h * Math.exp(1 - h);
}
