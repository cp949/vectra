import type { MatLike, PivotOptions } from './types';

/** pivot zero 판정과 elimination zero cleanup의 default tolerance. */
export const DEFAULT_PIVOT_EPSILON = 1e-9;

/**
 * `PivotOptions.epsilon`을 검증하고 미지정 시 default(`DEFAULT_PIVOT_EPSILON`)를 반환한다.
 *
 * `epsilon`이 NaN, Infinity, 음수이면 `RangeError`.
 *
 * @param options pivot 옵션. `undefined`이면 default를 사용한다.
 * @param name error message에 사용할 옵션 인자 이름
 */
export function resolvePivotEpsilon(options: PivotOptions | undefined, name: string): number {
  const epsilon = options?.epsilon;
  if (epsilon === undefined) {
    return DEFAULT_PIVOT_EPSILON;
  }
  if (!Number.isFinite(epsilon) || epsilon < 0) {
    throw new RangeError(`${name}.epsilon must be a finite number >= 0, got ${String(epsilon)}`);
  }
  return epsilon;
}

/**
 * matrix를 row-major fresh `number[][]`로 deep copy한다.
 *
 * caller가 `extractMatrixShape`로 얻은 shape를 전달한다. row 참조를 공유하지 않는 새 nested
 * array를 반환해 in-place 변형(`partialPivotReorder`, `eliminateRows`)에 안전하게 쓸 수 있다.
 *
 * @param matrix 복사할 source matrix
 * @param rows 복사할 row 개수
 * @param columns 복사할 column 개수
 */
export function deepCopyMatrix(matrix: MatLike, rows: number, columns: number): number[][] {
  const temp: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    const src = matrix[r];
    const row = new Array<number>(columns);
    for (let c = 0; c < columns; c++) {
      row[c] = src[c];
    }
    temp[r] = row;
  }
  return temp;
}

/**
 * partial pivoting 기준으로 `temp`의 row 순서를 재배열한다.
 *
 * `min(rows, columns)`개의 diagonal에 대해, 각 diagonal `i`에서 column `i`를 보고 `r >= i`인
 * 행 중 `Math.abs(temp[r][i])`가 최대인 row와 row `i`를 swap한다. 최대 절대값이 `epsilon`
 * 이하이면 해당 diagonal에서는 swap하지 않고 다음 diagonal로 이동한다.
 *
 * `temp`는 caller가 deep copy로 준비한 row-major matrix여야 한다. row 참조 swap만으로
 * 재배열하므로 column 값은 변하지 않는다.
 *
 * @param temp partial pivoting을 적용할 fresh `number[][]`
 * @param rows row 개수
 * @param columns column 개수
 * @param epsilon zero pivot 판정 tolerance
 * @returns 발생한 row swap 횟수
 */
export function partialPivotReorder(temp: number[][], rows: number, columns: number, epsilon: number): number {
  const diagonals = Math.min(rows, columns);
  let swaps = 0;
  for (let i = 0; i < diagonals; i++) {
    let maxRow = i;
    let maxAbs = Math.abs(temp[i][i]);
    for (let r = i + 1; r < rows; r++) {
      const a = Math.abs(temp[r][i]);
      if (a > maxAbs) {
        maxAbs = a;
        maxRow = r;
      }
    }
    if (maxAbs <= epsilon) {
      continue;
    }
    if (maxRow !== i) {
      const tmp = temp[i];
      temp[i] = temp[maxRow];
      temp[maxRow] = tmp;
      swaps++;
    }
  }
  return swaps;
}

/** `eliminateRows`의 결과. rank는 pivot 개수, swaps는 partial pivoting row swap 횟수. */
export interface EliminationResult {
  readonly rank: number;
  readonly swaps: number;
}

/**
 * partial pivoting Gaussian elimination을 `temp` matrix에 적용한다.
 *
 * `reduced = false`(REF):
 *  - pivot row를 1로 normalize하지 않는다.
 *  - 각 pivot column의 pivot row 아래(`r > pivotRow`) entry만 0으로 elimination한다.
 *
 * `reduced = true`(RREF):
 *  - pivot row를 pivot 값으로 나눠 1로 normalize한다.
 *  - 각 pivot column의 pivot row 위/아래(`r !== pivotRow`) entry를 모두 0으로 elimination한다.
 *
 * pivot 후보 절대값이 `epsilon` 이하이면 해당 column에서는 pivot을 선택하지 않고 다음 column으로
 * 이동한다. elimination 결과 `Math.abs(value) <= epsilon`이면 `0`으로 cleanup한다(`-0` 미보존).
 * 결과 entry가 finite number가 아니면 `RangeError`. `temp`는 caller가 fresh deep copy를 전달한다.
 *
 * @param temp elimination을 적용할 fresh `number[][]`
 * @param rows row 개수
 * @param columns column 개수
 * @param epsilon pivot zero 판정과 zero cleanup tolerance
 * @param reduced `true`이면 RREF, `false`이면 REF
 * @returns 발견된 pivot 개수(rank)와 partial pivoting row swap 횟수
 */
export function eliminateRows(
  temp: number[][],
  rows: number,
  columns: number,
  epsilon: number,
  reduced: boolean
): EliminationResult {
  let pivotRow = 0;
  let swaps = 0;
  for (let c = 0; c < columns && pivotRow < rows; c++) {
    let maxRow = pivotRow;
    let maxAbs = Math.abs(temp[pivotRow][c]);
    for (let r = pivotRow + 1; r < rows; r++) {
      const a = Math.abs(temp[r][c]);
      if (a > maxAbs) {
        maxAbs = a;
        maxRow = r;
      }
    }
    if (maxAbs <= epsilon) {
      // zero column. pivot row 위치는 그대로 두고 다음 column으로 이동한다.
      // r >= pivotRow의 entry는 모두 epsilon 이하이므로 그대로 0으로 정리한다.
      // r < pivotRow의 entry는 이전 step의 결과이며 epsilon보다 큰 값이면 유지한다.
      // 잔존 -0 또는 epsilon 이하 잡음만 cleanup한다.
      for (let r = 0; r < rows; r++) {
        if (Math.abs(temp[r][c]) <= epsilon) {
          temp[r][c] = 0;
        }
      }
      continue;
    }
    if (maxRow !== pivotRow) {
      const tmp = temp[pivotRow];
      temp[pivotRow] = temp[maxRow];
      temp[maxRow] = tmp;
      swaps++;
    }
    const pivotValue = temp[pivotRow][c];
    const pivotRowArr = temp[pivotRow];
    if (reduced) {
      for (let cc = c; cc < columns; cc++) {
        const v = pivotRowArr[cc] / pivotValue;
        if (!Number.isFinite(v)) {
          throw new RangeError(
            `matrix elimination produced non-finite pivot row entry at [${pivotRow}][${cc}], got ${String(v)}`
          );
        }
        pivotRowArr[cc] = Math.abs(v) <= epsilon ? 0 : v;
      }
      pivotRowArr[c] = 1;
    }
    const startRow = reduced ? 0 : pivotRow + 1;
    for (let r = startRow; r < rows; r++) {
      if (r === pivotRow) {
        continue;
      }
      const row = temp[r];
      const factor = reduced ? row[c] : row[c] / pivotValue;
      if (!Number.isFinite(factor)) {
        throw new RangeError(
          `matrix elimination produced non-finite factor at row ${r}, column ${c}, got ${String(factor)}`
        );
      }
      if (factor === 0) {
        row[c] = 0;
        continue;
      }
      for (let cc = c; cc < columns; cc++) {
        const v = row[cc] - factor * pivotRowArr[cc];
        if (!Number.isFinite(v)) {
          throw new RangeError(`matrix elimination produced non-finite value at [${r}][${cc}], got ${String(v)}`);
        }
        row[cc] = Math.abs(v) <= epsilon ? 0 : v;
      }
      row[c] = 0;
    }
    pivotRow++;
  }
  return { rank: pivotRow, swaps };
}
