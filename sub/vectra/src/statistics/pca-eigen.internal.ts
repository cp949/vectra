import { type JacobiSymmetricEigenRawResult, jacobiSymmetricEigenRaw } from '../internal/jacobi-symmetric-eigen';
import type { ResolvedPCAOptions } from './pca-options.internal';

/** symmetric Jacobi eigen 결과. 수렴 실패는 `undefined`로 caller에 위임한다. */
export type SymmetricEigenResult = JacobiSymmetricEigenRawResult;

/**
 * symmetric finite square matrix `matrix`(`n x n`)에 cyclic Jacobi rotation을 적용해 eigenvalue
 * diagonal과 column matrix 형태의 eigenvector를 계산한다.
 *
 * caller는 다음 전제를 보장한다.
 *
 *  - `matrix`는 rectangular, square, finite, symmetric matrix다.
 *  - `n >= 1`. empty / 1x1은 caller가 분기 처리한다.
 *
 * @param matrix symmetric finite square matrix
 * @param n matrix 크기. `>= 1`.
 * @param resolved 검증된 PCA 옵션
 */
export function jacobiSymmetricEigen(
  matrix: readonly (readonly number[])[],
  n: number,
  resolved: ResolvedPCAOptions
): SymmetricEigenResult | undefined {
  const { maxIterations, tolerance } = resolved;
  return jacobiSymmetricEigenRaw(matrix, n, {
    maxIterations,
    tolerance,
    errorPrefix: 'PCA Jacobi rotation',
  });
}

/** eigenvalue/eigenvector ordering 결과. `rank`는 cleanup 후 strict positive eigenvalue 개수다. */
export interface OrderedEigen {
  /** 정렬된 eigenvalue 배열. descending 순서. negative eigenvalue clamp / zero cleanup / `-0` canonicalize 적용. */
  readonly values: number[];

  /** `values[i]`에 대응하는 eigenvector를 row로 재배치한 matrix. row=component, column=original variable. */
  readonly components: number[][];

  /** `epsilon` 기준 strict positive eigenvalue 개수. */
  readonly rank: number;
}

/**
 * Jacobi 결과의 eigenvalue를 descending 순서로 정렬하고, eigenvector(column matrix)를 row matrix로
 * 전치해 component로 사용한다. cleanup 정책은 다음과 같다.
 *
 *  - eigenvalue가 `[-epsilon, 0)`이면 `0`으로 clamp한다.
 *  - eigenvalue가 `< -epsilon`이면 numeric failure로 보고 `undefined`를 반환한다(caller가 그대로 전파).
 *  - eigenvalue / component entry의 `Math.abs <= epsilon`은 `0`으로 cleanup하고 `-0`은 `+0`으로 canonicalize.
 *  - 각 component row의 첫 strict non-zero entry가 양수가 되도록 sign을 뒤집는다.
 *
 * @param raw Jacobi 결과
 * @param n matrix 크기
 * @param epsilon rank 판정 / clamp / cleanup tolerance
 */
export function orderEigenDescending(raw: SymmetricEigenResult, n: number, epsilon: number): OrderedEigen | undefined {
  const order = new Array<number>(n);
  for (let i = 0; i < n; i++) order[i] = i;

  const clampedValues = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const v = raw.values[i];
    if (v < -epsilon) {
      return undefined;
    }
    clampedValues[i] = v < 0 ? 0 : v;
  }

  order.sort((a, b) => clampedValues[b] - clampedValues[a]);

  const values = new Array<number>(n);
  const components: number[][] = new Array(n);
  let rank = 0;
  for (let i = 0; i < n; i++) {
    const src = order[i];
    const clamped = clampedValues[src];
    const cleaned = Math.abs(clamped) <= epsilon ? 0 : clamped;
    const canonical = Object.is(cleaned, -0) ? 0 : cleaned;
    values[i] = canonical;
    if (canonical > epsilon) {
      rank++;
    }
  }

  for (let i = 0; i < n; i++) {
    const src = order[i];
    const row = new Array<number>(n);
    for (let c = 0; c < n; c++) {
      const v = raw.vectors[c][src];
      const cleaned = Math.abs(v) <= epsilon ? 0 : v;
      row[c] = Object.is(cleaned, -0) ? 0 : cleaned;
    }
    components[i] = row;
  }

  for (let i = 0; i < n; i++) {
    const row = components[i];
    let sign = 1;
    for (let c = 0; c < n; c++) {
      const v = row[c];
      if (v !== 0) {
        sign = v < 0 ? -1 : 1;
        break;
      }
    }
    if (sign === -1) {
      for (let c = 0; c < n; c++) {
        const v = -row[c];
        row[c] = Object.is(v, -0) ? 0 : v;
      }
    }
  }

  return { values, components, rank };
}
