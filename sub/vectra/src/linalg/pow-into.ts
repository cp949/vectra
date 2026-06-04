import { commitMatrixInto } from './commit-matrix.internal';
import { DEFAULT_PIVOT_EPSILON } from './elimination.internal';
import {
  canonicalizeNegativeZeroSquareMatrix,
  copySquareMatrix,
  invertFiniteSquareMatrix,
  makeIdentitySquareMatrix,
  multiplyFiniteSquareMatrices,
  validateFiniteSquareMatrix,
} from './square-matrix.internal';
import type { MatLike, MatWritable } from './types';

/**
 * square matrix를 integer `exponent` 만큼 거듭제곱한 결과 `matrix^exponent`를 `out`에 기록한다.
 *
 * `matrix`는 square rectangular nested array여야 한다. `rows !== columns`이면 `RangeError`.
 * ragged matrix 또는 non-finite entry는 `RangeError`.
 * `exponent`는 `Number.isSafeInteger(exponent)`를 만족해야 한다. NaN, Infinity, 비정수,
 * safe integer 범위 밖은 `RangeError`.
 * `exponent === 0`은 identity matrix를 기록한다. 빈 matrix `[]`도 `[]`이 identity다.
 * `exponent === 1`은 deep copy를 기록한다.
 * `exponent > 1`은 exponentiation by squaring으로 계산하며 모든 intermediate 곱셈 결과 entry가
 * finite number여야 한다. 위반 시 `RangeError`.
 * `exponent < 0`은 먼저 `matrix`의 inverse를 partial pivoting Gauss-Jordan elimination으로
 * 계산하고 `|exponent|` 만큼 거듭제곱한다. singular matrix는 `RangeError`.
 * `out`은 `[n, n]` shape에 맞는 row와 column capacity가 준비되어 있어야 한다. 부족하면
 * `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(temp matrix에서 계산을
 * 완성한 뒤 commit).
 * 성공 시 `out.length`는 `n`으로, 각 row length는 `n`으로 truncate된다. 결과 entry에는 `-0`이
 * 남지 않는다.
 *
 * `out === matrix` aliasing을 허용한다. temp matrix에서 결과를 만든 뒤 commit한다.
 *
 * @param out 거듭제곱 결과를 기록할 writable matrix. `[n, n]`에 맞는 capacity가 준비되어 있어야 한다.
 * @param matrix 거듭제곱할 square matrix
 * @param exponent 거듭제곱 지수. safe integer만 허용한다.
 */
export function powInto<Out extends MatWritable>(out: Out, matrix: MatLike, exponent: number): Out {
  if (!Number.isSafeInteger(exponent)) {
    throw new RangeError(`exponent must be a safe integer, got ${String(exponent)}`);
  }
  const n = validateFiniteSquareMatrix(matrix, 'matrix');
  if (n === 0) {
    commitMatrixInto(out, [], 0, 0, 'out');
    return out;
  }
  if (exponent === 0) {
    const result = makeIdentitySquareMatrix(n);
    commitMatrixInto(out, result, n, n, 'out');
    return out;
  }
  let base: number[][];
  let positiveExponent: number;
  if (exponent < 0) {
    const inverse = invertFiniteSquareMatrix(matrix, n, DEFAULT_PIVOT_EPSILON);
    if (inverse === undefined) {
      throw new RangeError('matrix is singular; negative exponent requires an invertible matrix');
    }
    base = inverse;
    positiveExponent = -exponent;
  } else {
    base = copySquareMatrix(matrix, n);
    positiveExponent = exponent;
  }
  if (positiveExponent === 1) {
    canonicalizeNegativeZeroSquareMatrix(base, n);
    commitMatrixInto(out, base, n, n, 'out');
    return out;
  }
  // exponentiation by squaring. safe integer 전체 범위를 지원해야 하므로 bitwise op 대신 산술 연산을 쓴다.
  let result: number[][] | undefined;
  let factor: number[][] = base;
  let remaining = positiveExponent;
  while (remaining > 0) {
    if (remaining % 2 === 1) {
      result = result === undefined ? copySquareMatrix(factor, n) : multiplyFiniteSquareMatrices(result, factor, n);
    }
    remaining = Math.floor(remaining / 2);
    if (remaining > 0) {
      factor = multiplyFiniteSquareMatrices(factor, factor, n);
    }
  }
  if (result === undefined) {
    // positiveExponent >= 1 보장으로 인해 loop는 항상 result를 한 번 이상 채운다.
    throw new Error('unreachable: positiveExponent guarantees result is initialized');
  }
  canonicalizeNegativeZeroSquareMatrix(result, n);
  commitMatrixInto(out, result, n, n, 'out');
  return out;
}
