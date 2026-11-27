/** 기본 near-equality 허용 오차. */
export const DEFAULT_EPSILON = 1e-9;

/**
 * `hypot2`가 `Math.sqrt`를 쓰는 `x * x + y * y`의 하한.
 *
 * 이 값보다 크면 큰 쪽 제곱이 normal 범위라 상대 정밀도를 잃지 않는다.
 * 작은 쪽 제곱이 subnormal로 떨어져도 합에 비해 무시할 크기다.
 */
const HYPOT_SQRT_MIN = 1e-290;

/**
 * `Math.hypot(x, y)`와 같은 Euclidean 길이를 반환한다.
 *
 * 제곱합이 overflow·underflow하지 않으면 `Math.sqrt(x * x + y * y)`를 쓴다.
 * - V8의 `Math.hypot`은 이 경로보다 약 10배 느리다.
 * - 참값 대비 오차는 최대 약 1.2 ulp다. V8 `Math.hypot`은 최대 약 2 ulp다.
 * - 그래서 `Math.hypot`과 결과가 최대 2 ulp 다를 수 있다.
 *
 * 제곱합이 overflow(`Infinity`), underflow, 0, NaN이면 `Math.hypot`을 쓴다.
 * 큰 finite 좌표, subnormal 좌표, `Infinity`와 NaN의 조합은 `Math.hypot`과 같은 값이다.
 *
 * @param x 첫 성분
 * @param y 둘째 성분
 */
export function hypot2(x: number, y: number): number {
  const s = x * x + y * y;
  if (s > HYPOT_SQRT_MIN && s < Infinity) return Math.sqrt(s);
  return Math.hypot(x, y);
}

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
