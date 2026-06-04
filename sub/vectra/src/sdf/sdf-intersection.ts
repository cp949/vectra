import { canonicalizeZero, requireFinite } from './primitive.internal';

/**
 * 두 signed distance 값의 intersection을 반환한다.
 *
 * `max(a, b)`다. 두 shape 모두에 속해야 interior이므로 더 큰(더 바깥) distance를 고른다.
 * boundary tie와 `-0` 입력은 `+0`으로 정규화한다.
 *
 * 두 입력은 finite여야 한다. `NaN`, `Infinity`, `-Infinity`는 `RangeError`다.
 *
 * @param a 첫 번째 signed distance 값
 * @param b 두 번째 signed distance 값
 */
export function sdfIntersection(a: number, b: number): number {
  requireFinite(a, 'intersection a');
  requireFinite(b, 'intersection b');

  return canonicalizeZero(Math.max(a, b));
}
