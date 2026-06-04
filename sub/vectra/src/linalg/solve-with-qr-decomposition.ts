import { DEFAULT_PIVOT_EPSILON } from './elimination.internal';
import { performTriangularSubstitution } from './substitution.internal';
import type { QRDecomposition, QROptions, VecLike } from './types';
import { assertFiniteVector, assertNonNegativeSafeInteger } from './validate.internal';

/**
 * `QROptions.epsilon`을 검증하고 미지정 시 default(`DEFAULT_PIVOT_EPSILON`)를 반환한다.
 *
 * `epsilon`이 NaN, Infinity, 음수이면 `RangeError`. tolerance 의미는 `solveWithQrDecomposition`의
 * JSDoc과 동일하다.
 *
 * @param options QR 옵션. `undefined`이면 default를 사용한다.
 * @param name error message에 사용할 옵션 인자 이름
 */
function resolveQrEpsilon(options: QROptions | undefined, name: string): number {
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
 * 이미 계산된 `QRDecomposition`과 우변 `b`로 `A * x = b` 또는 `A * x ≈ b`의 해 `x`를 backward
 * substitution으로 계산해 새 `number[]`로 반환한다. full-column-rank(`rank === n`)에서만 해를
 * 반환한다. rank-deficient(`rank < n`)는 parameterization이 필요하므로 `undefined`. `R`의 diagonal
 * abs가 `epsilon` 이하이면 singular로 보고 `undefined`.
 *
 * decomposition은 `A = Q * R`의 thin form이다. `orthogonal`은 `m x rank` orthonormal column matrix,
 * `upper`는 `rank x n` upper coefficient matrix다. tall full-column-rank case(`m > n`, `rank === n`)
 * 에서는 `Q^T * Q = I_n`이므로 `Q * R * x = b`의 normal equation `R^T * R * x = R^T * Q^T * b`가
 * `R * x = Q^T * b`로 환원된다. 따라서 `qTb[j] = Σ_i orthogonal[i][j] * b[i]`를 계산해 `R`을
 * backward substitution으로 푼다.
 *
 * `decomposition.rank`는 비음의 safe integer여야 한다. 음수, NaN, Infinity, 비정수,
 * `Number.MAX_SAFE_INTEGER` 초과는 `RangeError`.
 * `decomposition.orthogonal`은 `Array.isArray`인 rectangular nested array여야 한다. `rank > 0`이면
 * 모든 row 길이가 `rank`여야 한다. 위반 시 `RangeError`.
 * `decomposition.upper`는 `Array.isArray`인 rectangular nested array여야 한다. `rank > 0`이면
 * `upper.length === rank`이고 모든 row 길이가 같은 `n`이어야 한다. 위반 시 `RangeError`.
 * `rank === 0`이면 `orthogonal === []`, `upper === []`이어야 한다. one-sided zero shape는 `RangeError`.
 *
 * `rank === 0` shape ambiguity: `QRDecomposition`은 `rank === 0`에서 원본 `m`/`n`을 보존하지 않는다.
 * 따라서 `b.length === 0`일 때만 `[]`을 반환하고, `b.length > 0`이면 `m`을 확인할 수 없으므로
 * `RangeError`를 던진다.
 *
 * `rank > 0`이면 `orthogonal.length === b.length`를 요구한다(`m = b.length`로 해석). 위반 시
 * `RangeError`.
 * `orthogonal`, `upper`, `b`의 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시
 * `RangeError`. epsilon 검증은 다른 input 검증보다 먼저 수행한다.
 * `epsilon`은 `R` diagonal zero 판정과 `R` lower 영역 zero 판정(backward substitution의
 * cleanup check)에만 쓰인다. input/result finite validation에는 사용하지 않는다(tolerance-split).
 *
 * `rank < n`이면 rank-deficient/underdetermined parameterization이 필요하므로 `undefined`를 반환한다.
 * `rank === n`이면 `qTb[j] = Σ_i orthogonal[i][j] * b[i]`를 finite 누적으로 계산해 `R * x = qTb`를
 * backward substitution으로 푼다. 누적 도중 `Number.isFinite(term)` 또는 `Number.isFinite(sum)`이
 * 위반되면 `RangeError`. `R` diagonal abs가 `epsilon` 이하이면 `undefined`. backward substitution
 * 도중 누적 합 또는 division 결과가 finite number가 아니면 `RangeError`.
 *
 * 결과 entry에는 `-0`이 남지 않는다(substitution helper가 `+0`으로 canonicalize). 결과는 input
 * vector 참조를 공유하지 않는 새 `number[]`다.
 *
 * @param decomposition 이미 계산된 thin QR decomposition. `A = Q * R` 형태.
 * @param b 우변 벡터. `rank > 0`이면 `decomposition.orthogonal.length`와 같은 길이여야 한다.
 *   `rank === 0`이면 `[]`이어야 한다.
 * @param options QR 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function solveWithQrDecomposition(
  decomposition: QRDecomposition,
  b: VecLike,
  options?: QROptions
): number[] | undefined {
  const epsilon = resolveQrEpsilon(options, 'options');

  const rank = decomposition.rank;
  assertNonNegativeSafeInteger(rank, 'decomposition.rank');

  const orthogonal = decomposition.orthogonal;
  const upper = decomposition.upper;
  if (!Array.isArray(orthogonal)) {
    throw new RangeError(`decomposition.orthogonal must be an array, got ${String(orthogonal)}`);
  }
  if (!Array.isArray(upper)) {
    throw new RangeError(`decomposition.upper must be an array, got ${String(upper)}`);
  }

  if (rank === 0) {
    if (orthogonal.length !== 0) {
      throw new RangeError(`decomposition.orthogonal must be [] when rank === 0, got length ${orthogonal.length}`);
    }
    if (upper.length !== 0) {
      throw new RangeError(`decomposition.upper must be [] when rank === 0, got length ${upper.length}`);
    }
    // rank === 0이면 source `m`/`n` shape를 잃는다. b가 비어 있을 때만 []를 반환하고, 그 외에는
    // m을 확인할 수 없어 RangeError.
    if (b.length !== 0) {
      throw new RangeError(`decomposition rank === 0 cannot resolve solve shape: b.length (${b.length}) must be 0`);
    }
    return [];
  }

  // rank > 0. upper.length === rank이고 upper의 모든 row length === n이어야 한다.
  if (upper.length !== rank) {
    throw new RangeError(`decomposition.upper.length must be ${rank} (rank), got ${upper.length}`);
  }
  const firstUpperRow = upper[0];
  if (!Array.isArray(firstUpperRow)) {
    throw new RangeError(`decomposition.upper[0] must be an array`);
  }
  const n = firstUpperRow.length;
  if (n === 0) {
    // rank > 0이면 n >= rank >= 1이어야 한다. row length === 0은 구조 위반.
    throw new RangeError(`decomposition.upper one-sided zero shape [${rank}, 0] is not supported`);
  }
  for (let r = 1; r < rank; r++) {
    const row = upper[r];
    if (!Array.isArray(row)) {
      throw new RangeError(`decomposition.upper[${r}] must be an array`);
    }
    if (row.length !== n) {
      throw new RangeError(`decomposition.upper is not rectangular: row ${r} has length ${row.length}, expected ${n}`);
    }
  }

  // orthogonal.length === m이고 모든 row length === rank여야 한다. m === b.length로 해석한다.
  const m = orthogonal.length;
  if (m !== b.length) {
    throw new RangeError(`decomposition.orthogonal.length (${m}) must equal b.length (${b.length})`);
  }
  if (m === 0) {
    // m === 0이면 rank > 0인데 row가 없어 inconsistent. (실제로 valid QR에서는 m >= rank.)
    throw new RangeError(`decomposition.orthogonal is empty but rank ${rank} requires m >= rank`);
  }
  for (let i = 0; i < m; i++) {
    const row = orthogonal[i];
    if (!Array.isArray(row)) {
      throw new RangeError(`decomposition.orthogonal[${i}] must be an array`);
    }
    if (row.length !== rank) {
      throw new RangeError(
        `decomposition.orthogonal is not rectangular: row ${i} has length ${row.length}, expected ${rank}`
      );
    }
  }

  // finite 검증. 검증을 통과해야 누적 단계의 RangeError가 overflow 의미로만 발생한다.
  for (let i = 0; i < m; i++) {
    const row = orthogonal[i];
    for (let j = 0; j < rank; j++) {
      const value = row[j];
      if (!Number.isFinite(value)) {
        throw new RangeError(`decomposition.orthogonal[${i}][${j}] must be a finite number, got ${String(value)}`);
      }
    }
  }
  for (let r = 0; r < rank; r++) {
    const row = upper[r];
    for (let c = 0; c < n; c++) {
      const value = row[c];
      if (!Number.isFinite(value)) {
        throw new RangeError(`decomposition.upper[${r}][${c}] must be a finite number, got ${String(value)}`);
      }
    }
  }
  assertFiniteVector(b, 'b');

  if (rank < n) {
    // rank-deficient / underdetermined는 parameterization이 필요해 본 helper에서 해를 반환하지 않는다.
    return undefined;
  }

  // rank === n인 full-column-rank만 해를 계산한다. upper는 rank x n = n x n square다.
  // qTb[j] = Σ_i orthogonal[i][j] * b[i]를 finite 누적으로 계산한다.
  const qTb = new Array<number>(n);
  for (let j = 0; j < n; j++) {
    let sum = 0;
    for (let i = 0; i < m; i++) {
      const term = orthogonal[i][j] * b[i];
      if (!Number.isFinite(term)) {
        throw new RangeError(
          `decomposition.orthogonal^T * b produced non-finite intermediate at [${j}][${i}], got ${String(term)}`
        );
      }
      sum += term;
      if (!Number.isFinite(sum)) {
        throw new RangeError(
          `decomposition.orthogonal^T * b accumulator overflowed at column ${j}, got ${String(sum)}`
        );
      }
    }
    qTb[j] = sum;
  }

  return performTriangularSubstitution(upper, n, (r) => qTb[r], epsilon, false, 'decomposition.upper');
}
