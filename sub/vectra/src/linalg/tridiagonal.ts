import { tridiagonalInto } from './tridiagonal-into';
import type { VecLike } from './types';
import { assertFiniteVector } from './validate.internal';

/**
 * 세 vector를 main/sub/super diagonal로 갖는 tridiagonal square matrix를 새 `number[][]`로 반환한다.
 *
 * `diagonalEntries`, `leftEntries`, `rightEntries`의 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `n = diagonalEntries.length`라 할 때 `leftEntries.length === n - 1`, `rightEntries.length === n - 1`이어야 한다.
 * `n === 0` 또는 `n === 1`이면 left/right length는 `0`이어야 한다. 위반 시 `RangeError`.
 * 결과 shape는 `[n, n]`. diagonal/sub/super 외 entry는 `0`.
 * `n === 0`은 `[]`를 반환한다.
 *
 * @param diagonalEntries main diagonal 값.
 * @param leftEntries sub-diagonal 값. length는 `n - 1`(또는 `n` ≤ 1이면 `0`).
 * @param rightEntries super-diagonal 값. length는 `n - 1`(또는 `n` ≤ 1이면 `0`).
 */
export function tridiagonal(diagonalEntries: VecLike, leftEntries: VecLike, rightEntries: VecLike): number[][] {
  assertFiniteVector(diagonalEntries, 'diagonalEntries');
  assertFiniteVector(leftEntries, 'leftEntries');
  assertFiniteVector(rightEntries, 'rightEntries');
  const n = diagonalEntries.length;
  const out: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    out[r] = new Array(n);
  }
  return tridiagonalInto(out, diagonalEntries, leftEntries, rightEntries);
}
