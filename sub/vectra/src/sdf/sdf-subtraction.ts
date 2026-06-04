import { canonicalizeZero, requireFinite } from './primitive.internal';

/**
 * 첫 번째 signed distance에서 두 번째 signed distance를 빼낸 차집합을 반환한다.
 *
 * `max(a, -b)`다. `a - b`가 아니다. second shape interior(`b < 0`)를 first shape에서 제거하므로
 * 그 영역에서는 `-b`가 boundary distance를 지배한다. boundary tie와 `-0` 결과는 `+0`으로 정규화한다.
 *
 * 두 입력은 finite여야 한다. `NaN`, `Infinity`, `-Infinity`는 `RangeError`다.
 *
 * @param a 유지할 first shape의 signed distance 값
 * @param b 제거할 second shape의 signed distance 값
 */
export function sdfSubtraction(a: number, b: number): number {
  requireFinite(a, 'subtraction a');
  requireFinite(b, 'subtraction b');

  return canonicalizeZero(Math.max(a, -b));
}
