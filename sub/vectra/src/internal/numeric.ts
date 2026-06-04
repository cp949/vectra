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
