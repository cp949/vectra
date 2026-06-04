import type { WhiteningOptions } from './types';
import { whitenInto } from './whiten-into';

/**
 * `data`의 Cholesky 기반 whitening transform 결과를 새 `number[][]`로 반환한다.
 *
 * 정책, validation, orientation/mode/epsilon 처리, SPD 실패 분기는 `whitenInto`와 동일하다. 결과 matrix는 입력
 * orientation과 같은 shape이고 `Cov(z) ≈ I`다. 결과의 `-0`은 `0`으로 canonicalize한다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `whitenInto`와 동일하다.
 * @param data whitening할 row-major rectangular finite number matrix. mutate하지 않는다.
 * @param options 옵션. `orientation` 기본 `"columns"`, `mode` 기본 `"population"`, `epsilon` 기본 `1e-9`.
 */
export function whiten(data: readonly (readonly number[])[], options?: WhiteningOptions): number[][] {
  return whitenInto([], data, options);
}
