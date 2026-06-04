import { eliminateRows } from './elimination.internal';

/**
 * `(A - lambda I) * v = 0`의 nullspace에서 deterministic vector 1개를 만들어 `epsilon` 정책으로
 * normalize + sign 고정한 결과를 반환한다.
 *
 * caller는 finite + square 검증을 끝낸 `A`와 finite `lambda`를 전달한다. `epsilon`은
 * `eliminateRows`의 pivot zero 판정과 nullspace pivot 판정에 사용한다(`solveByGaussianElimination`
 * 정책과 동일한 의미).
 *
 * 알고리즘:
 *
 *  1. `temp[i][j] = A[i][j] - (i === j ? lambda : 0)` augmented matrix를 만든다(rhs column 없이
 *     coefficient 영역만).
 *  2. partial pivoting RREF를 적용한다.
 *  3. pivot column을 ascending으로 모은다. pivot count가 `n`과 같으면 lambda는 eigenvalue가 아니므로
 *     `undefined`.
 *  4. 가장 큰 index의 free variable을 `1`로 두고 나머지 free variable은 `0`으로 둔다.
 *  5. 각 pivot row `i`에 대해 basic variable 값을 `-RREF[i][lastFreeCol]`로 채운다.
 *  6. Euclidean norm으로 normalize한다. norm이 `epsilon` 이하이면 numeric failure로 `undefined`.
 *  7. 결과 vector의 첫 strict non-zero entry가 양수가 되도록 sign을 고정한다. zero cleanup과
 *     `-0` canonicalize도 함께 적용한다.
 *
 * @param matrix square finite matrix
 * @param n matrix 크기. `>= 1`.
 * @param lambda eigenvalue 후보. finite number.
 * @param epsilon pivot zero / nullspace pivot / zero cleanup tolerance
 */
export function computeNullspaceUnitVectorForLambda(
  matrix: readonly (readonly number[])[],
  n: number,
  lambda: number,
  epsilon: number
): number[] | undefined {
  const temp: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    const src = matrix[r];
    const row = new Array<number>(n);
    for (let c = 0; c < n; c++) {
      row[c] = c === r ? src[c] - lambda : src[c];
    }
    temp[r] = row;
  }

  eliminateRows(temp, n, n, epsilon, true);

  const pivotColumns: number[] = [];
  const pivotRows: number[] = [];
  for (let r = 0; r < n; r++) {
    const row = temp[r];
    let pivotCol = -1;
    for (let c = 0; c < n; c++) {
      if (Math.abs(row[c]) > epsilon) {
        pivotCol = c;
        break;
      }
    }
    if (pivotCol === -1) {
      continue;
    }
    pivotColumns.push(pivotCol);
    pivotRows.push(r);
  }

  if (pivotColumns.length === n) {
    return undefined;
  }

  let lastFreeCol = -1;
  let pivotIdx = pivotColumns.length - 1;
  for (let c = n - 1; c >= 0; c--) {
    if (pivotIdx >= 0 && pivotColumns[pivotIdx] === c) {
      pivotIdx--;
      continue;
    }
    lastFreeCol = c;
    break;
  }
  // pivotColumns.length < n임이 위 분기에서 보장되므로, descending c 루프가 반드시 free column을
  // 하나 찾는다. lastFreeCol === -1은 caller invariant 위반이라 silent undefined로 흘리지 않는다.
  if (lastFreeCol === -1) {
    throw new RangeError(
      `nullspace invariant violated: pivotColumns.length=${pivotColumns.length} < n=${n} 인데 free column을 찾지 못함`
    );
  }

  const vector = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    vector[i] = 0;
  }
  vector[lastFreeCol] = 1;
  for (let i = 0; i < pivotColumns.length; i++) {
    const pc = pivotColumns[i];
    const pr = pivotRows[i];
    const coeff = temp[pr][lastFreeCol];
    const value = -coeff;
    if (!Number.isFinite(value)) {
      throw new RangeError(
        `eigenvector back-substitution produced non-finite value at column ${pc}, got ${String(value)}`
      );
    }
    vector[pc] = value;
  }

  let normSquared = 0;
  for (let i = 0; i < n; i++) {
    normSquared += vector[i] * vector[i];
    if (!Number.isFinite(normSquared)) {
      throw new RangeError(`eigenvector norm accumulator overflowed, got ${String(normSquared)}`);
    }
  }
  const norm = Math.sqrt(normSquared);
  if (!Number.isFinite(norm)) {
    throw new RangeError(`eigenvector norm produced non-finite value, got ${String(norm)}`);
  }
  if (norm <= epsilon) {
    return undefined;
  }

  let sign = 1;
  for (let i = 0; i < n; i++) {
    const v = vector[i];
    if (v !== 0) {
      sign = v < 0 ? -1 : 1;
      break;
    }
  }

  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const scaled = (sign * vector[i]) / norm;
    if (!Number.isFinite(scaled)) {
      throw new RangeError(`eigenvector normalization produced non-finite value at index ${i}, got ${String(scaled)}`);
    }
    const cleaned = Math.abs(scaled) <= epsilon ? 0 : scaled;
    out[i] = Object.is(cleaned, -0) ? 0 : cleaned;
  }
  return out;
}
