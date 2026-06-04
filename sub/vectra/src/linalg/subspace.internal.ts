import { eliminateRows } from './elimination.internal';
import type { MatLike } from './types';

/**
 * RREF 결과에서 추출한 pivot/free column 정보.
 *
 * `pivotRows[i]`는 `pivotColumns[i]`의 pivot이 위치한 row index다. 두 배열은 ascending column
 * 순서로 묶여 있다. `freeColumns`는 pivot이 없는 column index를 ascending으로 모은다.
 */
export interface RrefPivotInfo {
  readonly pivotRows: number[];
  readonly pivotColumns: number[];
  readonly freeColumns: number[];
}

/**
 * RREF temp matrix에서 pivot row/column과 free column index를 추출한다.
 *
 * caller는 `eliminateRows(temp, rows, columns, epsilon, true)`로 만든 fresh RREF temp를 전달한다.
 * 각 row마다 첫 entry `|temp[r][c]| > epsilon`인 column이 그 row의 pivot이다. pivot이 없는 row는
 * zero row이며 무시한다.
 *
 * @param rref reduced row echelon form temp matrix
 * @param rows row 개수
 * @param columns column 개수
 * @param epsilon pivot zero 판정 tolerance
 */
export function extractRrefPivotInfo(rref: MatLike, rows: number, columns: number, epsilon: number): RrefPivotInfo {
  const pivotRows: number[] = [];
  const pivotColumns: number[] = [];
  const isPivotColumn = new Array<boolean>(columns);
  for (let c = 0; c < columns; c++) {
    isPivotColumn[c] = false;
  }
  for (let r = 0; r < rows; r++) {
    const row = rref[r];
    let pc = -1;
    for (let c = 0; c < columns; c++) {
      if (Math.abs(row[c]) > epsilon) {
        pc = c;
        break;
      }
    }
    if (pc === -1) {
      continue;
    }
    pivotRows.push(r);
    pivotColumns.push(pc);
    isPivotColumn[pc] = true;
  }
  const freeColumns: number[] = [];
  for (let c = 0; c < columns; c++) {
    if (!isPivotColumn[c]) {
      freeColumns.push(c);
    }
  }
  return { pivotRows, pivotColumns, freeColumns };
}

/**
 * RREF canonical nullspace basis를 만든다.
 *
 * 각 free column `f`마다 길이 `columns`의 basis vector 하나를 생성한다. basis vector의 entry는
 * 다음과 같다.
 *
 *  - `c === f`: `1`.
 *  - `c === pivotColumns[i]`: `-rref[pivotRows[i]][f]`. pivot column마다 한 번씩.
 *  - 그 외 free column: `0`.
 *
 * 결과 entry는 `Math.abs(value) <= epsilon`이면 `0`으로 cleanup하고 `-0`은 `+0`으로 canonicalize한다.
 * back-substitution 결과 non-finite는 `RangeError`.
 *
 * `freeColumns.length === 0`이면 `[]`. caller는 `extractRrefPivotInfo`로 얻은 `info`를 전달한다.
 *
 * @param rref reduced row echelon form temp matrix
 * @param columns column 개수
 * @param info `extractRrefPivotInfo` 결과
 * @param epsilon zero cleanup tolerance
 */
export function buildRrefNullSpaceBasis(
  rref: MatLike,
  columns: number,
  info: RrefPivotInfo,
  epsilon: number
): number[][] {
  const { pivotRows, pivotColumns, freeColumns } = info;
  const k = freeColumns.length;
  const basis: number[][] = new Array(k);
  for (let i = 0; i < k; i++) {
    const f = freeColumns[i];
    const vector = new Array<number>(columns);
    for (let c = 0; c < columns; c++) {
      vector[c] = 0;
    }
    vector[f] = 1;
    for (let p = 0; p < pivotColumns.length; p++) {
      const pc = pivotColumns[p];
      const pr = pivotRows[p];
      const raw = -rref[pr][f];
      if (!Number.isFinite(raw)) {
        throw new RangeError(
          `null space back-substitution produced non-finite value at column ${pc}, got ${String(raw)}`
        );
      }
      const cleaned = Math.abs(raw) <= epsilon ? 0 : raw;
      vector[pc] = Object.is(cleaned, -0) ? 0 : cleaned;
    }
    basis[i] = vector;
  }
  return basis;
}

/**
 * `eliminateRows`로 RREF temp matrix를 만들고 pivot/free column 정보를 추출한다.
 *
 * caller는 finite + shape 검증을 끝낸 `matrix`와 deep copy된 fresh `temp`를 전달한다. `temp`는
 * elimination으로 mutate된다.
 *
 * @param temp deep copy로 받은 fresh `number[][]`. in-place로 RREF가 적용된다.
 * @param rows row 개수
 * @param columns column 개수
 * @param epsilon pivot zero / zero cleanup tolerance
 */
export function computeRrefPivotInfo(temp: number[][], rows: number, columns: number, epsilon: number): RrefPivotInfo {
  eliminateRows(temp, rows, columns, epsilon, true);
  return extractRrefPivotInfo(temp, rows, columns, epsilon);
}
