/**
 * matrix covariance/correlation의 variable materialization, centered 통계 helper.
 *
 * `data`는 row-major `readonly (readonly number[])[]`다.
 * `orientation: "columns"`는 row를 observation, column을 variable로 본다.
 * `orientation: "rows"`는 row를 variable, column을 observation으로 본다.
 *
 * 모든 도우미는 caller가 commit 시점에 atomicity를 직접 보장할 수 있도록 fresh storage를 만든다.
 */

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
