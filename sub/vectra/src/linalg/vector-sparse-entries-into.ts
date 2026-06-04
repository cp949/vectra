import type { SparseOptions, SparseVectorEntry, VecLike } from './types';
import { assertFiniteVector, assertSparseEpsilon } from './validate.internal';

/**
 * vector의 `Math.abs(value) > epsilon`인 entry만 `{ index, value }` 형태로 `out`에 push한다.
 *
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 비음의 finite number여야 한다. 위반 시 `RangeError`.
 * `out`은 push 전에 `out.length = 0`으로 비워진다. 입력 validation 통과 후 비우기와 push가 시작되므로
 * validation 실패 시 `out`은 호출 전 상태 그대로 남는다.
 *
 * @param out sparse entry를 기록할 writable array
 * @param vector sparse 표현으로 추출할 vector
 * @param options sparse 변환 옵션. `epsilon` 미지정 시 exact zero(`0`).
 */
export function vectorSparseEntriesInto(
  out: SparseVectorEntry[],
  vector: VecLike,
  options?: SparseOptions
): SparseVectorEntry[] {
  const epsilon = options?.epsilon ?? 0;
  assertSparseEpsilon(epsilon);
  assertFiniteVector(vector, 'vector');
  out.length = 0;
  const n = vector.length;
  for (let i = 0; i < n; i++) {
    const value = vector[i];
    if (Math.abs(value) > epsilon) {
      out.push({ index: i, value });
    }
  }
  return out;
}
