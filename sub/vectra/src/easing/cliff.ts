import { assertFiniteT, cliffRaw } from './easing.internal';
import type { CliffOptions } from './types';

/**
 * threshold 주변 `width` 폭의 연속(C1) 전이 scalar shaping 함수다.
 *
 * `edge0 = threshold - width / 2`, `edge1 = threshold + width / 2`,
 * `u = clamp((t - edge0) / width, 0, 1)`, 반환 `u * u * (3 - 2 * u)` (smoothstep ramp).
 * `t <= edge0` → `0`, `t >= edge1` → `1`, `t === threshold` → `0.5`. band 안에서는 0과 1 사이
 * 중간값을 갖는다 (hard step 아님). `0`/`1` endpoint는 band가 `[0, 1]` 밖으로 걸치지 않을 때만 exact.
 * `hold`/`step`은 hard discontinuity이지만 `cliff`은 `width > 0` 연속 전이다.
 * `t`는 finite number여야 한다.
 * `threshold`는 finite number여야 한다. 위반 시 RangeError.
 * `width`는 finite positive number(`> 0`)여야 한다. 위반 시 RangeError (`0`이면 hard step이 되므로 막는다).
 *
 * @param t easing progress (보통 [0, 1])
 * @param options `threshold` 전이 중심(finite, 기본 `0.5`)와 `width` 전이 폭(finite positive, 기본 `0.1`).
 */
export function cliff(t: number, options?: CliffOptions): number {
  assertFiniteT(t);
  const threshold = options?.threshold ?? 0.5;
  if (!Number.isFinite(threshold)) {
    throw new RangeError('easing cliff threshold must be a finite number');
  }
  const width = options?.width ?? 0.1;
  if (!Number.isFinite(width) || width <= 0) {
    throw new RangeError('easing cliff width must be a finite positive number (> 0)');
  }
  return cliffRaw(t, threshold, width);
}
