import { lerpArrayInto } from './lerp-array-into';

/**
 * number 배열 a와 b를 원소별로 선형 보간하여 새 배열로 반환한다.
 *
 * @param a 보간 시작 배열 (t=0일 때의 값).
 * @param b 보간 끝 배열 (t=1일 때의 값).
 * @param t 보간 비율. clamp하지 않으므로 범위 밖 값도 허용한다 (extrapolation 가능).
 *
 * degenerate 처리:
 * - 빈 배열(a=[], b=[])은 정상 처리하여 빈 배열을 반환한다.
 * - a.length !== b.length이면 RangeError를 던진다.
 * - t, a 원소, b 원소 중 finite하지 않은 값이 있으면 RangeError를 던진다.
 */
export function lerpArray(a: readonly number[], b: readonly number[], t: number): number[] {
  return lerpArrayInto([], a, b, t);
}
