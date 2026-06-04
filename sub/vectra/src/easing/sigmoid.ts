import { assertFiniteT } from './easing.internal';

/**
 * S 곡선 sigmoid scalar shaping 함수다.
 *
 * 수식: 1 / (1 + Math.exp(-steepness * (t - 0.5)))
 * t === 0.5이면 정확히 0.5. 단, endpoint(t=0, t=1)는 exact 보장하지 않는다.
 * t는 finite number여야 한다.
 * steepness는 finite number여야 한다. 0과 음수도 허용한다.
 *
 * @param t easing progress (보통 [0, 1])
 * @param steepness S 곡선 기울기. 기본값 10. 0이면 항상 0.5. 음수이면 반전 S 곡선.
 */
export function sigmoid(t: number, steepness = 10): number {
  assertFiniteT(t);
  if (!Number.isFinite(steepness)) {
    throw new RangeError('easing sigmoid steepness must be a finite number');
  }
  return 1 / (1 + Math.exp(-steepness * (t - 0.5)));
}
