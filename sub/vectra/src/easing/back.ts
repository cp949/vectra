import {
  assertFiniteOvershoot,
  assertFiniteT,
  backInOutRaw,
  backInRaw,
  backOutRaw,
  DEFAULT_BACK_OVERSHOOT,
} from './easing.internal';

/**
 * back ease-in 함수다.
 *
 * 시작 지점에서 overshoot만큼 반대 방향으로 먼저 이동한 뒤 진행한다.
 * 수식: `t * t * ((s + 1) * t - s)` (s = overshoot)
 * t는 finite number여야 한다.
 * overshoot은 finite number여야 한다. 음수 overshoot은 anticipation 방향을 반전한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 * @param overshoot 되감기 강도 (기본값 1.70158)
 */
export function backIn(t: number, overshoot: number = DEFAULT_BACK_OVERSHOOT): number {
  assertFiniteT(t);
  assertFiniteOvershoot(overshoot);
  if (t === 0) return 0;
  if (t === 1) return 1;
  return backInRaw(t, overshoot);
}

/**
 * back ease-out 함수다.
 *
 * 끝 지점에서 overshoot만큼 지나쳤다가 되돌아온다.
 * 수식: `(t - 1) ** 2 * ((s + 1) * (t - 1) + s) + 1` (s = overshoot)
 * t는 finite number여야 한다.
 * overshoot은 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 * @param overshoot 되감기 강도 (기본값 1.70158)
 */
export function backOut(t: number, overshoot: number = DEFAULT_BACK_OVERSHOOT): number {
  assertFiniteT(t);
  assertFiniteOvershoot(overshoot);
  if (t === 0) return 0;
  if (t === 1) return 1;
  return backOutRaw(t, overshoot);
}

/**
 * back ease-in-out 함수다.
 *
 * 시작과 끝 양쪽에서 overshoot이 적용된다.
 * t < 0.5 구간: `(2t)^2 * ((s*1.525 + 1) * 2t - s*1.525) / 2`
 * t >= 0.5 구간: `((2t-2)^2 * ((s*1.525 + 1) * (2t-2) + s*1.525) + 2) / 2`
 * t는 finite number여야 한다.
 * overshoot은 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 * @param overshoot 되감기 강도 (기본값 1.70158)
 */
export function backInOut(t: number, overshoot: number = DEFAULT_BACK_OVERSHOOT): number {
  assertFiniteT(t);
  assertFiniteOvershoot(overshoot);
  if (t === 0) return 0;
  if (t === 1) return 1;
  return backInOutRaw(t, overshoot);
}
