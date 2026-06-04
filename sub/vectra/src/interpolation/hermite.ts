import type { CardinalTangentOptions } from '../types';
import { assertFiniteNumbers, clampScalar } from './interpolation.internal';

/**
 * cubic Hermite basis로 scalar 보간값을 반환한다.
 *
 * 공식:
 *   h00 = 2t^3 - 3t^2 + 1
 *   h10 = t^3 - 2t^2 + t
 *   h01 = -2t^3 + 3t^2
 *   h11 = t^3 - t^2
 *   result = h00 * a + h10 * tangentA + h01 * b + h11 * tangentB
 *
 * `t`를 clamp하지 않으며 extrapolation을 허용한다.
 * tangent는 normalized segment parameter `t in [0, 1]` 기준 derivative다.
 * 모든 인자는 finite number여야 한다.
 *
 * @param a `t === 0`일 때의 값 (시작점)
 * @param tangentA `t === 0`에서의 tangent
 * @param b `t === 1`일 때의 값 (끝점)
 * @param tangentB `t === 1`에서의 tangent
 * @param t clamp하지 않는 보간 비율
 */
export function cubicHermite(a: number, tangentA: number, b: number, tangentB: number, t: number): number {
  assertFiniteNumbers([a, tangentA, b, tangentB, t]);
  return cubicHermiteRaw(a, tangentA, b, tangentB, t);
}

/**
 * t를 `[0, 1]`로 clamp한 뒤 cubic Hermite basis로 scalar 보간값을 반환한다.
 *
 * t-clamp 방식이며 extrapolation을 허용하지 않는다.
 * value result를 clamp하지 않는다.
 * 모든 인자는 finite number여야 한다.
 *
 * @param a `t === 0`일 때의 값 (시작점)
 * @param tangentA `t === 0`에서의 tangent
 * @param b `t === 1`일 때의 값 (끝점)
 * @param tangentB `t === 1`에서의 tangent
 * @param t `[0, 1]`로 clamp되는 보간 비율
 */
export function cubicHermiteClamped(a: number, tangentA: number, b: number, tangentB: number, t: number): number {
  assertFiniteNumbers([a, tangentA, b, tangentB, t]);
  return cubicHermiteRaw(a, tangentA, b, tangentB, clampScalar(t, 0, 1));
}

/**
 * Cardinal tangent 공식으로 scalar tangent를 반환한다.
 *
 * 공식: `(1 - tension) * (next - prev) / 2`
 * `prev`, `next`는 finite number여야 한다.
 * `tension`은 `[0, 1]` 범위의 finite number여야 한다. 범위 밖이면 `RangeError`.
 * 기본 tension은 `0`이다.
 *
 * @param prev 이전 scalar 값
 * @param next 다음 scalar 값
 * @param options tension 옵션. `tension` 기본값 `0`
 */
export function tangentCardinal(prev: number, next: number, options?: CardinalTangentOptions): number {
  const tension = options?.tension ?? 0;

  assertFiniteNumbers([prev, next, tension]);

  if (tension < 0 || tension > 1) {
    throw new RangeError('tension must be in [0, 1]');
  }

  return ((1 - tension) * (next - prev)) / 2;
}

/**
 * 네 인접점의 Cardinal tangent를 사용해 `a`→`b` 구간에서 scalar 보간값을 반환한다.
 *
 * tangentA = tangentCardinal(prev, b, options)
 * tangentB = tangentCardinal(a, next, options)
 *
 * `t`를 clamp하지 않으며 extrapolation을 허용한다.
 * endpoint duplication은 caller가 결정한다.
 * 모든 scalar 인자는 finite number여야 한다.
 *
 * @param prev `a` 이전 scalar 값 (tangentA 계산에 사용)
 * @param a `t === 0`일 때의 값 (시작점)
 * @param b `t === 1`일 때의 값 (끝점)
 * @param next `b` 다음 scalar 값 (tangentB 계산에 사용)
 * @param t clamp하지 않는 보간 비율
 * @param options tension 옵션. `tension` 기본값 `0`
 */
export function cubicHermiteFromPoints(
  prev: number,
  a: number,
  b: number,
  next: number,
  t: number,
  options?: CardinalTangentOptions
): number {
  // tangentCardinal이 prev, b, tension과 a, next, tension을 각각 검증한다.
  const tangentA = tangentCardinal(prev, b, options);
  const tangentB = tangentCardinal(a, next, options);

  assertFiniteNumbers([t]);

  return cubicHermiteRaw(a, tangentA, b, tangentB, t);
}

/**
 * 네 인접점의 Cardinal tangent를 사용해 `a`→`b` 구간에서 scalar 보간값을 반환한다.
 *
 * `t`를 `[0, 1]`로 clamp한 뒤 계산한다.
 * value result를 clamp하지 않는다.
 * 모든 scalar 인자는 finite number여야 한다.
 *
 * @param prev `a` 이전 scalar 값 (tangentA 계산에 사용)
 * @param a `t === 0`일 때의 값 (시작점)
 * @param b `t === 1`일 때의 값 (끝점)
 * @param next `b` 다음 scalar 값 (tangentB 계산에 사용)
 * @param t `[0, 1]`로 clamp되는 보간 비율
 * @param options tension 옵션. `tension` 기본값 `0`
 */
export function cubicHermiteFromPointsClamped(
  prev: number,
  a: number,
  b: number,
  next: number,
  t: number,
  options?: CardinalTangentOptions
): number {
  // tangentCardinal이 prev, b, tension과 a, next, tension을 각각 검증한다.
  const tangentA = tangentCardinal(prev, b, options);
  const tangentB = tangentCardinal(a, next, options);

  assertFiniteNumbers([t]);

  const ct = clampScalar(t, 0, 1);

  return cubicHermiteRaw(a, tangentA, b, tangentB, ct);
}

/**
 * cubic Hermite 계산을 validation 없이 수행한다.
 *
 * 호출 전 finite 검증을 호출자가 보장해야 한다.
 */
function cubicHermiteRaw(a: number, tangentA: number, b: number, tangentB: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;

  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;

  return h00 * a + h10 * tangentA + h01 * b + h11 * tangentB;
}
