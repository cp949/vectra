import { assertFiniteT } from './easing.internal';

/**
 * Hermite 기반 smoothstep scalar shaping 함수다.
 *
 * 수식: t * t * (3 - 2 * t)
 * [0, 1] 입력에서 [0, 1] 출력. clamp하지 않는다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 * t는 finite number여야 한다.
 *
 * @param t easing progress (보통 [0, 1])
 */
export function smoothstep(t: number): number {
  assertFiniteT(t);
  return t * t * (3 - 2 * t);
}
