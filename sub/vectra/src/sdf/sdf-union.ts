import { canonicalizeZero, requireFinite } from './primitive.internal';

/**
 * 두 signed distance 값의 union을 반환한다.
 *
 * `min(a, b)`다. 두 shape 중 한 곳에라도 속하면 interior이므로 더 작은(더 안쪽) distance를 고른다.
 * boundary tie와 `-0` 입력은 `+0`으로 정규화한다.
 *
 * 두 입력은 finite여야 한다. `NaN`, `Infinity`, `-Infinity`는 `RangeError`다.
 *
 * @param a 첫 번째 signed distance 값
 * @param b 두 번째 signed distance 값
 */
export function sdfUnion(a: number, b: number): number {
  requireFinite(a, 'union a');
  requireFinite(b, 'union b');

  return canonicalizeZero(Math.min(a, b));
}
