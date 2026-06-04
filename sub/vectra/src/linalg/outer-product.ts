import { outerProductInto } from './outer-product-into';
import type { VecLike } from './types';

/**
 * 두 vector의 outer product `[a[i] * b[j]]`를 새 `number[][]`로 반환한다.
 *
 * 결과 shape는 `[a.length, b.length]`이다.
 * 두 vector는 모두 non-empty여야 한다. 빈 vector는 one-sided zero shape를 만들어 nested matrix
 * 표현과 충돌하므로 `RangeError`.
 * 입력 vector entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 각 곱 `a[i] * b[j]`도 finite number여야 한다(overflow 시 `RangeError`).
 * 결과 entry에 `-0`이 남지 않는다(`+0`으로 canonicalize).
 *
 * 새 storage에 결과를 채우므로 `a`/`b`와 aliasing 문제는 없다. 동작 자체는 동일한 정책의
 * `outerProductInto`에 위임한다.
 *
 *
 * caller-responsibility 가정은 `outerProductInto`와 동일하다.
 * @param a outer product의 좌측 vector
 * @param b outer product의 우측 vector
 */
export function outerProduct(a: VecLike, b: VecLike): number[][] {
  const rows = a.length;
  const columns = b.length;
  const out: number[][] = new Array(rows);
  for (let i = 0; i < rows; i++) {
    out[i] = new Array(columns);
  }
  return outerProductInto(out, a, b);
}
