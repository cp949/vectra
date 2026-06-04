import { chainProductInto } from './chain-product-into';
import type { MatLike } from './types';

/**
 * matrix chain의 좌-우 누적 곱 `matrices[0] * matrices[1] * ... * matrices[N-1]`을 새 `number[][]`로 반환한다.
 *
 * `matrices.length === 0`이면 identity shape를 추론할 수 없어 `RangeError`.
 * 모든 matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 인접한 matrix는 `matrices[i].columns === matrices[i+1].rows`여야 한다. 위반 시 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 모든 중간 누적 entry가 finite number여야 한다. 위반 시 `RangeError`.
 * `matrices.length === 1`이면 `matrices[0]`을 deep copy한 결과를 반환한다.
 *
 * @param matrices 좌-우 순서대로 곱할 matrix 배열. 1개 이상이어야 하며 인접 shape가 호환되어야 한다.
 */
export function chainProduct(matrices: readonly MatLike[]): number[][] {
  if (matrices.length === 0) {
    throw new RangeError('chainProduct requires at least one matrix');
  }
  const first = matrices[0];
  const last = matrices[matrices.length - 1];
  const rows = Array.isArray(first) ? first.length : 0;
  const lastFirstRow = Array.isArray(last) && last.length > 0 ? last[0] : undefined;
  const columns = Array.isArray(lastFirstRow) ? lastFirstRow.length : 0;
  const out: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    out[r] = new Array(columns);
  }
  return chainProductInto(out, matrices);
}
