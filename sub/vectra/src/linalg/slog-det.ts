import { deepCopyMatrix, eliminateRows, resolvePivotEpsilon } from './elimination.internal';
import type { MatLike, PivotOptions, SLogDetResult } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * square matrix의 determinant를 `{ sign, logAbsDet }` 형태로 반환한다.
 *
 * partial pivoting Gaussian elimination을 REF 형태로 수행한 뒤, diagonal pivot의 부호 곱과 swap
 * parity로 `sign`을, `Σ Math.log(Math.abs(pivot))`로 `logAbsDet`를 계산한다. `determinant`처럼
 * diagonal product를 직접 곱하지 않으므로 매우 큰/작은 |det| 행렬에서도 overflow / underflow 없이
 * finite `logAbsDet`를 얻는다.
 *
 * `matrix`는 square nested array여야 한다. `rows !== columns`이면 `RangeError`.
 * ragged matrix는 `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시 `RangeError`.
 * `epsilon`은 partial pivoting의 zero pivot 판정과 elimination 결과 entry zero cleanup에 쓰인다.
 * input/result finite validation에는 사용하지 않는다.
 * 빈 matrix `[]`는 empty product identity로 `{ sign: 1, logAbsDet: 0 }`를 반환한다.
 * pivot 후보 절대값이 `epsilon` 이하인 column이 하나라도 있으면 singular로 보고
 * `{ sign: 0, logAbsDet: Number.NEGATIVE_INFINITY }`를 반환한다. 이 `-Infinity`는 정의된 결과이며
 * `RangeError`로 분류하지 않는다.
 * elimination 도중 결과 entry가 finite number가 아니면 `RangeError`.
 * `logAbsDet` 누적이 non-finite(NaN/+Infinity)이면 `RangeError`. singular 경로의 `-Infinity`는
 * 누적 결과가 아니라 직접 반환 값이므로 이 규칙에서 제외한다.
 * non-singular 결과의 `logAbsDet`에는 `-0`이 남지 않는다(`+0`으로 canonicalize).
 *
 * 결과는 fixed plain object를 직접 반환한다(`*Into` variant를 제공하지 않는다).
 *
 * @param matrix determinant를 계산할 square matrix
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function slogDet(matrix: MatLike, options?: PivotOptions): SLogDetResult {
  const epsilon = resolvePivotEpsilon(options, 'options');
  const shape = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  const [rows, columns] = shape;
  if (rows !== columns) {
    throw new RangeError(`slogDet requires a square matrix, got shape [${rows}, ${columns}]`);
  }
  const n = rows;
  if (n === 0) {
    return { sign: 1, logAbsDet: 0 };
  }
  const temp = deepCopyMatrix(matrix, n, n);
  const { rank, swaps } = eliminateRows(temp, n, n, epsilon, false);
  if (rank < n) {
    return { sign: 0, logAbsDet: Number.NEGATIVE_INFINITY };
  }
  let sign: -1 | 1 = (swaps & 1) === 1 ? -1 : 1;
  let logAbsDet = 0;
  for (let i = 0; i < n; i++) {
    const pivot = temp[i][i];
    if (pivot < 0) {
      sign = (sign === 1 ? -1 : 1) as -1 | 1;
    }
    const abs = Math.abs(pivot);
    // pivot은 elimination 결과 |pivot| > epsilon이 보장되어 log 입력이 0 이하가 되지 않는다.
    // 누적 합도 finite step의 합이라 정상 입력에서는 finite를 벗어나지 않지만, 방어용으로 매
    // step overflow 가드를 둔다.
    logAbsDet += Math.log(abs);
    if (!Number.isFinite(logAbsDet)) {
      throw new RangeError(`slogDet log-abs accumulator overflowed at diagonal ${i}, got ${String(logAbsDet)}`);
    }
  }
  const cleanedLog = Object.is(logAbsDet, -0) ? 0 : logAbsDet;
  return { sign, logAbsDet: cleanedLog };
}
