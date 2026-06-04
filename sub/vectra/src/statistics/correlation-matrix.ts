import { correlationMatrixInto } from './correlation-matrix-into';
import type { CovarianceMatrixOptions } from './types';

/**
 * `data`의 correlation matrix를 새 `number[][]`로 반환한다.
 *
 * validation, orientation 정책, denominator 정책, zero variance, 실패 조건은 `correlationMatrixInto`와
 * 동일하다. variable count가 `0`이면 `[]`을 반환한다. 결과는 square symmetric matrix이고 diagonal은
 * 모두 `1`이다. 결과 entry의 `-0`은 `0`으로 canonicalize한다.
 *
 * @param data correlation matrix를 계산할 matrix. row-major rectangular finite number matrix.
 * @param options 옵션. `orientation` 기본 `"columns"`, `mode` 기본 `"population"`.
 */
export function correlationMatrix(data: readonly (readonly number[])[], options?: CovarianceMatrixOptions): number[][] {
  return correlationMatrixInto([], data, options);
}
