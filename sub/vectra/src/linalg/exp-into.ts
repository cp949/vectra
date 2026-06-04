import { commitMatrixInto } from './commit-matrix.internal';
import {
  canonicalizeNegativeZeroSquareMatrix,
  infinityNormFiniteSquareMatrix,
  makeIdentitySquareMatrix,
  multiplyFiniteSquareMatrices,
  validateFiniteSquareMatrix,
} from './square-matrix.internal';
import type { MatLike, MatrixExponentialOptions, MatWritable } from './types';

const DEFAULT_MAX_TERMS = 64;
const DEFAULT_TOLERANCE = 1e-12;
const DEFAULT_SCALING_THRESHOLD = 0.5;

interface ResolvedOptions {
  readonly maxTerms: number;
  readonly tolerance: number;
  readonly scalingThreshold: number;
}

function resolveOptions(options: MatrixExponentialOptions | undefined, name: string): ResolvedOptions {
  const maxTerms = options?.maxTerms ?? DEFAULT_MAX_TERMS;
  if (!Number.isSafeInteger(maxTerms) || maxTerms <= 0) {
    throw new RangeError(`${name}.maxTerms must be a positive safe integer, got ${String(maxTerms)}`);
  }
  const tolerance = options?.tolerance ?? DEFAULT_TOLERANCE;
  if (!Number.isFinite(tolerance) || tolerance < 0) {
    throw new RangeError(`${name}.tolerance must be a finite number >= 0, got ${String(tolerance)}`);
  }
  const scalingThreshold = options?.scalingThreshold ?? DEFAULT_SCALING_THRESHOLD;
  if (!Number.isFinite(scalingThreshold) || scalingThreshold <= 0) {
    throw new RangeError(`${name}.scalingThreshold must be a finite number > 0, got ${String(scalingThreshold)}`);
  }
  return { maxTerms, tolerance, scalingThreshold };
}

function scaleSquareMatrix(matrix: readonly (readonly number[])[], n: number, factor: number): number[][] {
  const out: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    const src = matrix[r];
    const row = new Array<number>(n);
    for (let c = 0; c < n; c++) {
      const v = src[c] * factor;
      if (!Number.isFinite(v)) {
        throw new RangeError(`scaled matrix entry at [${r}][${c}] must be a finite number, got ${String(v)}`);
      }
      row[c] = v;
    }
    out[r] = row;
  }
  return out;
}

function addSquareMatrixInPlace(target: number[][], delta: readonly (readonly number[])[], n: number): void {
  for (let r = 0; r < n; r++) {
    const targetRow = target[r];
    const deltaRow = delta[r];
    for (let c = 0; c < n; c++) {
      const v = targetRow[c] + deltaRow[c];
      if (!Number.isFinite(v)) {
        throw new RangeError(
          `matrix exponential accumulator entry at [${r}][${c}] must be a finite number, got ${String(v)}`
        );
      }
      targetRow[c] = v;
    }
  }
}

function divideSquareMatrixInPlace(matrix: number[][], n: number, divisor: number): void {
  for (let r = 0; r < n; r++) {
    const row = matrix[r];
    for (let c = 0; c < n; c++) {
      const v = row[c] / divisor;
      if (!Number.isFinite(v)) {
        throw new RangeError(`matrix exponential term entry at [${r}][${c}] must be a finite number, got ${String(v)}`);
      }
      row[c] = v;
    }
  }
}

/**
 * square matrix의 matrix exponential `e^matrix`를 `out`에 기록한다.
 *
 * scaling-and-squaring + Taylor series로 계산한다. 먼저 infinity norm 기반으로
 * `s = max(0, ceil(log2(norm / scalingThreshold)))`를 정해 `B = matrix / 2^s`를 만들고,
 * Taylor recurrence `term_k = term_{k-1} * B / k`로 `I + B + B^2/2! + ...`를 누적한다.
 * `||term_k||_inf <= tolerance`이면 수렴으로 본다. 그 다음 결과를 `s`번 제곱한다.
 *
 * `matrix`는 square rectangular nested array여야 한다. `rows !== columns`이면 `RangeError`.
 * ragged matrix 또는 non-finite entry는 `RangeError`.
 * `options.maxTerms`는 positive safe integer여야 한다. 위반 시 `RangeError`. 기본 `64`.
 * `options.tolerance`는 0 이상 finite number여야 한다. 위반 시 `RangeError`. 기본 `1e-12`.
 * `options.scalingThreshold`는 positive finite number여야 한다. 위반 시 `RangeError`. 기본 `0.5`.
 * `maxTerms` 안에 수렴하지 않으면 `RangeError`. 중간 term/누적/제곱 결과 entry가 non-finite가
 * 되는 즉시 `RangeError`.
 * `out`은 `[n, n]` shape에 맞는 row와 column capacity가 준비되어 있어야 한다. 부족하면 `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(temp matrix에서 계산을
 * 완성한 뒤 commit).
 * 빈 matrix `[]`는 `[]`을 기록한다.
 * 결과 entry에는 `-0`이 남지 않는다.
 *
 * `out === matrix` aliasing을 허용한다. temp matrix에서 결과를 만든 뒤 commit한다.
 *
 * @param out matrix exponential을 기록할 writable matrix. `[n, n]`에 맞는 capacity가 준비되어 있어야 한다.
 * @param matrix matrix exponential을 계산할 square matrix
 * @param options scaling, Taylor convergence 옵션. 미지정 시 default(maxTerms=64, tolerance=1e-12, scalingThreshold=0.5).
 */
export function expInto<Out extends MatWritable>(out: Out, matrix: MatLike, options?: MatrixExponentialOptions): Out {
  const { maxTerms, tolerance, scalingThreshold } = resolveOptions(options, 'options');
  const n = validateFiniteSquareMatrix(matrix, 'matrix');
  if (n === 0) {
    commitMatrixInto(out, [], 0, 0, 'out');
    return out;
  }
  const norm = infinityNormFiniteSquareMatrix(matrix, n);
  // norm <= scalingThreshold이면 s === 0, factor === 1로 deep copy.
  // norm > scalingThreshold이면 norm / scalingThreshold > 1이므로 ceil(log2(...)) >= 1.
  let s = 0;
  if (norm > scalingThreshold) {
    s = Math.ceil(Math.log2(norm / scalingThreshold));
  }
  // B = matrix / 2^s.
  const factor = s === 0 ? 1 : 1 / 2 ** s;
  // s >= 1024이면 2 ** s가 Infinity로 발산하고 factor === 0이 된다. 이 경우 scale된
  // base가 전부 0이 되어 Taylor가 즉시 I로 수렴하고 결과가 실제 e^matrix가 아닌 I로
  // silently 잘못된다. plan §정책 결정의 finite 검증 정책을 scaling factor에도 확장한다.
  if (!Number.isFinite(factor) || factor <= 0) {
    throw new RangeError(
      `matrix scaling factor must be a positive finite number; matrix infinity norm (${norm}) is too large relative to options.scalingThreshold (${scalingThreshold})`
    );
  }
  const base = scaleSquareMatrix(matrix, n, factor);
  // result = I, term = I로 시작해 k = 1..maxTerms 동안 term = term * B / k, result += term.
  const result = makeIdentitySquareMatrix(n);
  let term: number[][] = makeIdentitySquareMatrix(n);
  let converged = false;
  for (let k = 1; k <= maxTerms; k++) {
    term = multiplyFiniteSquareMatrices(term, base, n);
    divideSquareMatrixInPlace(term, n, k);
    addSquareMatrixInPlace(result, term, n);
    if (infinityNormFiniteSquareMatrix(term, n) <= tolerance) {
      converged = true;
      break;
    }
  }
  if (!converged) {
    throw new RangeError(`matrix exponential did not converge within maxTerms (${maxTerms})`);
  }
  // result를 s번 제곱해 e^matrix 완성.
  let squared: number[][] = result;
  for (let i = 0; i < s; i++) {
    squared = multiplyFiniteSquareMatrices(squared, squared, n);
  }
  canonicalizeNegativeZeroSquareMatrix(squared, n);
  commitMatrixInto(out, squared, n, n, 'out');
  return out;
}
