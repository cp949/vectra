/**
 * matrix covariance/correlation의 입력 검증, variable materialization, output commit helper.
 *
 * `data`는 row-major `readonly (readonly number[])[]`다.
 * `orientation: "columns"`는 row를 observation, column을 variable로 본다.
 * `orientation: "rows"`는 row를 variable, column을 observation으로 본다.
 *
 * 모든 도우미는 caller가 commit 시점에 atomicity를 직접 보장할 수 있도록 fresh storage를 만들거나
 * 검증 단계와 commit 단계를 분리한다.
 */

/**
 * `orientation`이 `"columns"` 또는 `"rows"`인지 검증한다. 위반 시 `RangeError`.
 *
 * @param orientation 검증할 orientation 값
 * @param name error message에 사용할 인자 이름
 */
export function assertOrientation(orientation: unknown, name: string): asserts orientation is 'columns' | 'rows' {
  if (orientation !== 'columns' && orientation !== 'rows') {
    throw new RangeError(`${name} must be "columns" | "rows", got ${String(orientation)}`);
  }
}

/**
 * `data`가 row-major rectangular `readonly (readonly number[])[]`임을 검증하고 각 row의 column 수가
 * 동일함을 보장한다.
 *
 * top-level 또는 row가 array가 아니면 `TypeError`. row length가 같지 않으면 `RangeError`.
 * 빈 matrix(`[]`)는 `rowCount = 0`, `columnCount = 0`을 반환한다.
 *
 * @param data 검증할 matrix
 * @param name error message에 사용할 인자 이름
 * @returns `rowCount`, `columnCount`. `rowCount === 0`이면 `columnCount === 0`.
 */
export function assertRectangularMatrix(data: unknown, name: string): { rowCount: number; columnCount: number } {
  if (!Array.isArray(data)) {
    throw new TypeError(`${name} must be a readonly number[][], got ${typeof data}`);
  }
  const rowCount = data.length;
  if (rowCount === 0) {
    return { rowCount: 0, columnCount: 0 };
  }
  const firstRow = data[0];
  if (!Array.isArray(firstRow)) {
    throw new TypeError(`${name}[0] must be a readonly number[], got ${typeof firstRow}`);
  }
  const columnCount = firstRow.length;
  for (let r = 1; r < rowCount; r++) {
    const row = data[r];
    if (!Array.isArray(row)) {
      throw new TypeError(`${name}[${r}] must be a readonly number[], got ${typeof row}`);
    }
    if (row.length !== columnCount) {
      throw new RangeError(
        `${name} must be rectangular: ${name}[${r}].length (${row.length}) !== ${name}[0].length (${columnCount})`
      );
    }
  }
  return { rowCount, columnCount };
}

/**
 * `data`로부터 variable별 observation vector를 fresh `number[]`로 materialize한다.
 *
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 결과 배열은 `out`/`data`의 nested array와 별도 인스턴스라 commit 단계의 aliasing 위험이 사라진다.
 *
 * @param data 검증된 rectangular matrix
 * @param rowCount `data.length`
 * @param columnCount 각 row의 길이
 * @param orientation `"columns"`이면 row가 observation, column이 variable. `"rows"`이면 row가 variable,
 *   column이 observation.
 * @returns `variables[v][s]` shape. `variableCount = orientation === "columns" ? columnCount : rowCount`,
 *   `sampleCount = orientation === "columns" ? rowCount : columnCount`.
 */
export function materializeVariables(
  data: readonly (readonly number[])[],
  rowCount: number,
  columnCount: number,
  orientation: 'columns' | 'rows'
): { variables: number[][]; sampleCount: number; variableCount: number } {
  const variableCount = orientation === 'columns' ? columnCount : rowCount;
  const sampleCount = orientation === 'columns' ? rowCount : columnCount;

  const variables: number[][] = new Array(variableCount);
  for (let v = 0; v < variableCount; v++) {
    variables[v] = new Array<number>(sampleCount);
  }

  if (orientation === 'columns') {
    for (let r = 0; r < rowCount; r++) {
      const row = data[r];
      for (let c = 0; c < columnCount; c++) {
        const value = row[c];
        if (!Number.isFinite(value)) {
          throw new RangeError(`data[${r}][${c}] must be a finite number, got ${String(value)}`);
        }
        variables[c][r] = value;
      }
    }
  } else {
    for (let r = 0; r < rowCount; r++) {
      const row = data[r];
      for (let c = 0; c < columnCount; c++) {
        const value = row[c];
        if (!Number.isFinite(value)) {
          throw new RangeError(`data[${r}][${c}] must be a finite number, got ${String(value)}`);
        }
        variables[r][c] = value;
      }
    }
  }

  return { variables, sampleCount, variableCount };
}

/**
 * variable의 finite-검증된 observation 평균을 계산한다.
 *
 * caller는 `samples`가 모두 finite임을 보장한다. 누적 sum이 non-finite면 `RangeError`. 결과 mean이
 * non-finite면 `RangeError`.
 *
 * @param samples 평균을 계산할 finite number 배열
 * @param variableIndex error message용 variable index
 */
export function computeVariableMean(samples: readonly number[], variableIndex: number): number {
  const length = samples.length;
  let sum = 0;
  for (let i = 0; i < length; i++) {
    sum += samples[i];
    if (!Number.isFinite(sum)) {
      throw new RangeError(`variable[${variableIndex}] sum must be finite, got ${String(sum)} at sample ${i}`);
    }
  }
  const mean = sum / length;
  if (!Number.isFinite(mean)) {
    throw new RangeError(`variable[${variableIndex}] mean must be finite, got ${String(mean)}`);
  }
  return mean;
}

/**
 * variable observation의 centered delta 배열을 fresh `number[]`로 반환하고 centered 제곱합을 함께
 * 돌려준다. centered delta 또는 centered 제곱이 non-finite면 `RangeError`.
 *
 * @param samples finite number 배열
 * @param mean variable mean
 * @param variableIndex error message용 variable index
 */
export function computeCenteredDeltas(
  samples: readonly number[],
  mean: number,
  variableIndex: number
): { deltas: number[]; squaredSum: number } {
  const length = samples.length;
  const deltas = new Array<number>(length);
  let squaredSum = 0;
  for (let i = 0; i < length; i++) {
    const delta = samples[i] - mean;
    if (!Number.isFinite(delta)) {
      throw new RangeError(
        `variable[${variableIndex}] centered delta at sample ${i} must be finite, got ${String(delta)}`
      );
    }
    deltas[i] = delta;
    const squared = delta * delta;
    if (!Number.isFinite(squared)) {
      throw new RangeError(
        `variable[${variableIndex}] squared delta at sample ${i} must be finite, got ${String(squared)}`
      );
    }
    squaredSum += squared;
    if (!Number.isFinite(squaredSum)) {
      throw new RangeError(
        `variable[${variableIndex}] squared sum must be finite, got ${String(squaredSum)} at sample ${i}`
      );
    }
  }
  return { deltas, squaredSum };
}

/**
 * 두 variable의 centered delta 배열로부터 centered product sum을 계산한다. product 또는 product sum이
 * non-finite면 `RangeError`.
 *
 * @param deltaA 첫 variable의 centered delta 배열
 * @param deltaB 둘째 variable의 centered delta 배열. `deltaA`와 같은 길이.
 * @param indexA error message용 첫 variable index
 * @param indexB error message용 둘째 variable index
 */
export function computeCenteredProductSum(
  deltaA: readonly number[],
  deltaB: readonly number[],
  indexA: number,
  indexB: number
): number {
  const length = deltaA.length;
  let productSum = 0;
  for (let i = 0; i < length; i++) {
    const product = deltaA[i] * deltaB[i];
    if (!Number.isFinite(product)) {
      throw new RangeError(
        `centered product at variables (${indexA}, ${indexB}) sample ${i} must be finite, got ${String(product)}`
      );
    }
    productSum += product;
    if (!Number.isFinite(productSum)) {
      throw new RangeError(
        `product sum at variables (${indexA}, ${indexB}) must be finite, got ${String(productSum)} at sample ${i}`
      );
    }
  }
  return productSum;
}

/**
 * `n x n` square matrix용 temp buffer를 fresh 배열로 할당한다.
 *
 * 각 row를 pre-allocate해 caller가 `temp[r][c] = value` 형태로 안전하게 write할 수 있게 한다.
 * caller는 모든 entry를 채운 뒤 `commitSymmetricMatrixInto`로 단일 commit한다.
 *
 * @param n matrix 한 변의 길이
 */
export function allocateSquareMatrixBuffer(n: number): number[][] {
  const buffer: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    buffer[r] = new Array<number>(n);
  }
  return buffer;
}

/**
 * 완성된 square symmetric matrix를 `out`에 commit한다.
 *
 * caller가 모든 validation/산술을 끝낸 뒤 단일 commit으로 호출한다. `out`을 새 row 배열로 교체해
 * `out`과 `data`가 같은 nested array여도 결과가 destroy되지 않도록 한다. 각 row entry의 `-0`은 `0`으로
 * canonicalize한다. `n === 0`이면 `out.length = 0`만 설정한다.
 *
 * @param out commit 대상 writable matrix
 * @param temp commit할 square matrix
 * @param n matrix 한 변의 길이
 */
export function commitSymmetricMatrixInto(out: number[][], temp: readonly (readonly number[])[], n: number): void {
  // out과 data가 같은 nested array일 수 있다. data row를 직접 덮어쓰지 않고 fresh row 배열을
  // 만들어 교체한다. 그래도 out 자체는 같은 외부 배열이라 length만 갱신한다.
  const fresh: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    const src = temp[r];
    const row = new Array<number>(n);
    for (let c = 0; c < n; c++) {
      const value = src[c];
      row[c] = Object.is(value, -0) ? 0 : value;
    }
    fresh[r] = row;
  }
  out.length = 0;
  for (let r = 0; r < n; r++) {
    out.push(fresh[r]);
  }
}

/**
 * 완성된 rectangular matrix(`rows × cols`)를 `out`에 commit한다.
 *
 * caller가 모든 validation/산술을 끝낸 뒤 단일 commit으로 호출한다. `out`을 새 row 배열로 교체해
 * `out`과 `data`가 같은 nested array여도 결과가 destroy되지 않도록 한다. 각 row entry의 `-0`은 `0`으로
 * canonicalize한다. `rows === 0`이면 `out.length = 0`만 설정한다.
 *
 * @param out commit 대상 writable matrix
 * @param temp commit할 rectangular matrix
 * @param rows row 개수
 * @param cols 각 row의 길이
 */
export function commitRectangularMatrixInto(
  out: number[][],
  temp: readonly (readonly number[])[],
  rows: number,
  cols: number
): void {
  // out과 data가 같은 nested array일 수 있다. fresh row 배열로 교체해 aliasing 위험을 제거한다.
  const fresh: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    const src = temp[r];
    const row = new Array<number>(cols);
    for (let c = 0; c < cols; c++) {
      const value = src[c];
      row[c] = Object.is(value, -0) ? 0 : value;
    }
    fresh[r] = row;
  }
  out.length = 0;
  for (let r = 0; r < rows; r++) {
    out.push(fresh[r]);
  }
}
