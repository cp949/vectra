import { lerpRaw } from './interpolation.internal';

/**
 * number 배열 a와 b를 원소별로 선형 보간하여 out에 기록한다.
 *
 * @param out  결과를 기록할 배열. error 시 변경하지 않는다.
 *             out === a 또는 out === b aliasing을 안전하게 허용한다.
 * @param a    보간 시작 배열 (t=0일 때의 값).
 * @param b    보간 끝 배열 (t=1일 때의 값).
 * @param t    보간 비율. clamp하지 않으므로 범위 밖 값도 허용한다 (extrapolation 가능).
 * @returns    out (항상 같은 참조를 반환한다).
 *
 * degenerate 처리:
 * - 빈 배열(a=[], b=[])은 정상 처리하여 out을 비운다.
 * - a.length !== b.length이면 RangeError를 던진다.
 * - t, a 원소, b 원소 중 finite하지 않은 값이 있으면 RangeError를 던진다.
 *
 * out clear 정책:
 * - 모든 validation을 통과하고 input snapshot을 끝낸 뒤 out.length = 0으로 초기화한다.
 * - error path에서는 기존 out을 변경하지 않는다.
 *
 * aliasing:
 * - out === a, out === b, a === b 모두 안전하게 처리한다.
 * - out clear 전에 a, b 값을 snapshot하므로 aliasing에서도 올바른 결과를 반환한다.
 */
export function lerpArrayInto(out: number[], a: readonly number[], b: readonly number[], t: number): number[] {
  if (a.length !== b.length) {
    throw new RangeError('interpolation arguments must have the same length');
  }

  if (!Number.isFinite(t)) {
    throw new RangeError('interpolation arguments must be finite numbers');
  }

  for (let i = 0; i < a.length; i++) {
    if (!Number.isFinite(a[i]) || !Number.isFinite(b[i])) {
      throw new RangeError('interpolation arguments must be finite numbers');
    }
  }

  // aliasing 안전을 위해 validation 후, out clear 전에 snapshot한다.
  const aVals = Array.from(a);
  const bVals = Array.from(b);

  out.length = 0;
  for (let i = 0; i < aVals.length; i++) {
    out.push(lerpRaw(aVals[i], bVals[i], t));
  }

  return out;
}
