import { resolvePivotEpsilon } from './elimination.internal';
import type { LinearSolveResult, MatLike, PivotOptions } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * 이미 RREF로 변환된 `[A | b]` augmented matrix를 unique / underdetermined / inconsistent로
 * 분류해 `LinearSolveResult`로 반환한다.
 *
 * 마지막 column을 RHS로 보고 그 앞 column들을 coefficient 영역으로 본다. 각 row의 leading
 * non-zero entry(`Math.abs(value) > epsilon`)를 coefficient 영역에서 찾아 pivot column으로
 * 수집한다. coefficient가 모두 `epsilon` 이하인 row의 RHS abs가 `epsilon`보다 크면 inconsistent
 * row로 본다.
 *
 * 분류 우선순위:
 *  1. inconsistent row가 하나라도 있으면 `{ type: 'inconsistent', rref }`.
 *  2. pivot column 수가 coefficient column 수와 같으면 `{ type: 'unique', solution }`.
 *  3. 그 외는 `{ type: 'underdetermined', rref, pivotColumns }`.
 *
 * 이 함수는 입력이 RREF인지 자체 검증하지 않는다. partial pivoting RREF helper의 결과를 그대로
 * 받는 분류 helper다. 단, 두 row가 동일한 pivot column을 가지면 malformed RREF로 보고
 * `RangeError`를 던진다.
 *
 * `rref`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`. column 수가 0이면
 * RHS column이 없어 분류할 수 없으므로 `RangeError`. 모든 entry는 finite number여야 한다. 위반 시
 * `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시
 * `RangeError`. epsilon 검증은 rref input 검증보다 먼저 수행한다.
 * `epsilon`은 pivot/RHS zero 판정에만 쓰인다. input/result finite validation에는 사용하지 않는다.
 *
 * `solution`과 `rref` deep copy 결과에는 `-0`을 남기지 않는다. `pivotColumns`는 row 순서대로
 * 수집되며, RREF는 row가 위에서 아래로 pivot column이 ascending하므로 결과도 ascending이다.
 *
 * @param rref 이미 RREF로 reduce된 augmented matrix `[A | b]`. 마지막 column이 RHS다.
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function extractSolutionFromRrefAugmentedMatrix(rref: MatLike, options?: PivotOptions): LinearSolveResult {
  const epsilon = resolvePivotEpsilon(options, 'options');
  const shape = extractMatrixShape(rref, 'rref');
  const [rows, columns] = shape;
  if (columns === 0) {
    throw new RangeError('rref must have at least one column (the RHS)');
  }
  assertFiniteMatrixEntries(rref, shape, 'rref');

  const coefficientColumns = columns - 1;
  const pivotColumns: number[] = [];
  // pivot column → row index. 같은 column이 두 번 등장하면 malformed RREF.
  const seenPivot = new Set<number>();
  let inconsistent = false;

  for (let r = 0; r < rows; r++) {
    const row = rref[r];
    let pivotCol = -1;
    for (let c = 0; c < coefficientColumns; c++) {
      if (Math.abs(row[c]) > epsilon) {
        pivotCol = c;
        break;
      }
    }
    if (pivotCol === -1) {
      // coefficient 영역이 모두 epsilon 이하. RHS abs > epsilon이면 inconsistent row.
      if (Math.abs(row[coefficientColumns]) > epsilon) {
        inconsistent = true;
      }
      continue;
    }
    if (seenPivot.has(pivotCol)) {
      throw new RangeError(`rref has duplicate pivot column ${pivotCol} (not in reduced row echelon form)`);
    }
    seenPivot.add(pivotCol);
    pivotColumns.push(pivotCol);
  }

  if (inconsistent) {
    return { type: 'inconsistent', rref: copyMatrix(rref, rows, columns) };
  }

  if (pivotColumns.length === coefficientColumns) {
    const solution = new Array<number>(coefficientColumns);
    for (let i = 0; i < coefficientColumns; i++) {
      solution[i] = 0;
    }
    for (let r = 0; r < rows; r++) {
      const row = rref[r];
      let pivotCol = -1;
      for (let c = 0; c < coefficientColumns; c++) {
        if (Math.abs(row[c]) > epsilon) {
          pivotCol = c;
          break;
        }
      }
      if (pivotCol === -1) {
        continue;
      }
      const value = row[coefficientColumns];
      solution[pivotCol] = value === 0 ? 0 : value;
    }
    return { type: 'unique', solution };
  }

  return {
    type: 'underdetermined',
    rref: copyMatrix(rref, rows, columns),
    pivotColumns,
  };
}

/**
 * rref를 deep copy하면서 `-0`을 `+0`으로 canonicalize한다.
 *
 * caller가 이미 shape, finite entry 검증을 끝낸 뒤 호출한다.
 */
function copyMatrix(matrix: MatLike, rows: number, columns: number): number[][] {
  const out: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    const src = matrix[r];
    const dst = new Array<number>(columns);
    for (let c = 0; c < columns; c++) {
      const v = src[c];
      dst[c] = v === 0 ? 0 : v;
    }
    out[r] = dst;
  }
  return out;
}
