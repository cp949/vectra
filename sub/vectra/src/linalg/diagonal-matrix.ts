import { diagonalMatrixInto } from './diagonal-matrix-into';
import type { VecLike } from './types';
import { assertFiniteVector } from './validate.internal';

/**
 * `diagonalEntries`를 main diagonal로 갖는 square matrix를 새 `number[][]`로 반환한다.
 *
 * 모든 `diagonalEntries[i]`는 finite number여야 한다. 위반 시 `RangeError`.
 * 결과 shape는 `[n, n]` (`n = diagonalEntries.length`). diagonal 외 entry는 0.
 * `diagonalEntries.length === 0`은 `[]`를 반환한다.
 *
 * @param diagonalEntries main diagonal 값. 모든 entry는 finite number여야 한다.
 */
export function diagonalMatrix(diagonalEntries: VecLike): number[][] {
  assertFiniteVector(diagonalEntries, 'diagonalEntries');
  const n = diagonalEntries.length;
  const out: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    out[r] = new Array(n);
  }
  return diagonalMatrixInto(out, diagonalEntries);
}
