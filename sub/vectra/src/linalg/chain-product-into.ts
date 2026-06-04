import { commitMatrixInto } from './commit-matrix.internal';
import type { MatLike, MatrixShape, MatWritable } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * matrix chain의 좌-우 누적 곱 `matrices[0] * matrices[1] * ... * matrices[N-1]`을 `out`에 기록한다.
 *
 * `matrices.length === 0`이면 identity shape를 추론할 수 없어 `RangeError`.
 * 모든 matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 인접한 matrix는 `matrices[i].columns === matrices[i+1].rows`여야 한다. 위반 시 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 모든 중간 누적 entry가 finite number여야 한다. 위반 시 `RangeError`.
 * `out`은 결과 shape `[matrices[0].rows, matrices[N-1].columns]`에 맞는 row와 column capacity가 준비되어 있어야 한다. 부족하면 `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(temp matrix에서 누적 계산을 완성한 뒤 commit).
 * 성공 시 `out.length`는 결과 row 수로, 각 row length는 결과 column 수로 truncate된다.
 * `matrices.length === 1`이면 `matrices[0]`을 deep copy해 `out`에 기록한다.
 *
 * `out === matrices[i]` aliasing(`i`는 어떤 index든)을 허용한다. temp matrix에서 결과를 만든 뒤 commit한다.
 *
 * @param out chain product를 기록할 writable matrix. 결과 shape에 맞는 capacity가 준비되어 있어야 한다.
 * @param matrices 좌-우 순서대로 곱할 matrix 배열. 1개 이상이어야 하며 인접 shape가 호환되어야 한다.
 */
export function chainProductInto<Out extends MatWritable>(out: Out, matrices: readonly MatLike[]): Out {
  if (matrices.length === 0) {
    throw new RangeError('chainProductInto requires at least one matrix');
  }
  const shapes: MatrixShape[] = new Array(matrices.length);
  for (let i = 0; i < matrices.length; i++) {
    const m = matrices[i];
    const s = extractMatrixShape(m, `matrices[${i}]`);
    assertFiniteMatrixEntries(m, s, `matrices[${i}]`);
    shapes[i] = s;
  }
  for (let i = 1; i < matrices.length; i++) {
    if (shapes[i - 1][1] !== shapes[i][0]) {
      throw new RangeError(
        `matrices[${i - 1}] columns (${shapes[i - 1][1]}) must equal matrices[${i}] rows (${shapes[i][0]})`
      );
    }
  }
  // matrices[0]을 deep copy해 누적 시작점으로 둔다. matrices.length === 1이어도 deep copy 후 commit한다.
  let accRows = shapes[0][0];
  let accColumns = shapes[0][1];
  let acc: number[][] = new Array(accRows);
  {
    const m0 = matrices[0];
    for (let r = 0; r < accRows; r++) {
      const row = m0[r];
      const accRow = new Array<number>(accColumns);
      for (let c = 0; c < accColumns; c++) {
        accRow[c] = row[c];
      }
      acc[r] = accRow;
    }
  }
  for (let step = 1; step < matrices.length; step++) {
    const b = matrices[step];
    const bColumns = shapes[step][1];
    const sharedDim = accColumns;
    if (accRows === 0 || bColumns === 0) {
      acc = [];
      accRows = 0;
      accColumns = 0;
      continue;
    }
    const next: number[][] = new Array(accRows);
    for (let i = 0; i < accRows; i++) {
      const accRow = acc[i];
      const nextRow = new Array<number>(bColumns);
      for (let j = 0; j < bColumns; j++) {
        let sum = 0;
        for (let k = 0; k < sharedDim; k++) {
          sum += accRow[k] * b[k][j];
        }
        if (!Number.isFinite(sum)) {
          throw new RangeError(
            `chain product step ${step} entry [${i}][${j}] must be a finite number, got ${String(sum)}`
          );
        }
        nextRow[j] = sum;
      }
      next[i] = nextRow;
    }
    acc = next;
    accColumns = bColumns;
  }
  commitMatrixInto(out, acc, accRows, accColumns, 'out');
  return out;
}
