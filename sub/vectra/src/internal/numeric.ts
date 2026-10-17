/** 기본 near-equality 허용 오차. */
export const DEFAULT_EPSILON = 1e-9;

/**
 * 두 number의 절대 차이가 epsilon 이하이면 true를 반환한다.
 *
 * finite 검증이나 상대 오차 보정은 하지 않는다.
 *
 * @param a 비교할 첫 번째 값
 * @param b 비교할 두 번째 값
 * @param epsilon 허용할 절대 오차
 */
export function nearEqualNumber(a: number, b: number, epsilon = DEFAULT_EPSILON): boolean {
  return Math.abs(a - b) <= epsilon;
}

const DEFAULT_EPSILON_SQ = DEFAULT_EPSILON * DEFAULT_EPSILON;

/**
 * `|cross|`가 평행 임계값을 넘으면(non-parallel) true를 반환한다. `Math.abs(cross) > 임계`와 같다.
 *
 * `epsilon`을 생략하면 임계는 `DEFAULT_EPSILON·|a|·|b|`(sin θ 기준)라 scale 불변이다.
 * 제곱으로 비교해 sqrt를 피한다. O(n²) self-intersection loop의 hot path다.
 * 명시하면 기존대로 절대 cross 값과 비교한다.
 * degenerate(|a|·|b| = 0)는 임계 0이라 cross = 0이 평행으로 처리된다.
 * `lenSq` 곱이 오버플로하면(방향 길이 약 1e77 이상) 상대 임계를 만들 수 없다.
 * 이때는 `DEFAULT_EPSILON` 절대 비교로 되돌려 기존 동작을 유지한다.
 * cross가 NaN이면 `crossExceeds`와 `crossWithin` 모두 false다. 기존 `>` / `<=` 비교와 같다.
 *
 * @param cross 두 방향 벡터의 cross product
 * @param epsilon 명시한 절대 cross 임계값. 생략하면 상대 임계값을 쓴다
 * @param aLenSq 첫 방향 벡터 길이의 제곱
 * @param bLenSq 둘째 방향 벡터 길이의 제곱
 */
export function crossExceeds(cross: number, epsilon: number | undefined, aLenSq: number, bLenSq: number): boolean {
  if (epsilon !== undefined) return Math.abs(cross) > epsilon;
  const lenSqProduct = aLenSq * bLenSq;
  if (lenSqProduct < Infinity) return cross * cross > DEFAULT_EPSILON_SQ * lenSqProduct;
  return Math.abs(cross) > DEFAULT_EPSILON;
}

/** `|cross|`가 평행 임계 이하이면(parallel) true를 반환한다. `Math.abs(cross) <= 임계`와 같다. `crossExceeds` 참고. */
export function crossWithin(cross: number, epsilon: number | undefined, aLenSq: number, bLenSq: number): boolean {
  if (epsilon !== undefined) return Math.abs(cross) <= epsilon;
  const lenSqProduct = aLenSq * bLenSq;
  if (lenSqProduct < Infinity) return cross * cross <= DEFAULT_EPSILON_SQ * lenSqProduct;
  return Math.abs(cross) <= DEFAULT_EPSILON;
}
