/**
 * advanced distribution sampler(`gamma`, `beta`, `dirichlet`, `multivariateNormal`)가 공유하는
 * parameter validation, gamma kernel, covariance Cholesky factorization 정책.
 *
 * 공개 sampler는 이 helper의 gamma kernel을 공유한다. public leaf끼리 helper 목적으로 직접 import하지
 * 않기 위해 공통 계산을 internal primitive로 내린다. 모든 kernel은 deterministic `RandomSource`와 함께
 * 쓰일 수 있으므로 branch별 `rng()` 소비 순서와 횟수가 observable behavior다.
 */

import { type RandomSource, random } from './random';
import { standardNormal } from './standard-normal';

/** Marsaglia-Tsang squeeze step의 표준 상수. */
const SQUEEZE_CONSTANT = 0.0331;

/**
 * `value`가 `> 0`인 finite number인지 검증한다.
 *
 * @param label error message에 쓸 parameter 이름.
 * @param value 검증할 값.
 * @throws {RangeError} value가 finite number가 아니거나 0 이하이면 던진다.
 */
export const assertPositiveFinite = (label: string, value: number): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label}은 0보다 큰 finite number여야 한다. 받은 값: ${value}`);
  }
};

/**
 * `shape >= 1`인 standard gamma(scale = 1) sample을 Marsaglia-Tsang 알고리즘으로 반환한다.
 *
 * rejection loop다. 각 iteration은 `standardNormal(rng)`로 `x`를 뽑고(`rng` 2회 소비), `v = (1 + c x)^3`이
 * `<= 0`이면 `x`만 소비하고 reject한다. `v > 0`이면 squeeze용 `u = random(rng)`(1회 소비)로 accept/reject를
 * 판정한다. accepted iteration의 `rng` 소비는 3회, `v <= 0` reject iteration은 2회다.
 *
 * caller는 `shape >= 1`을 보장한다.
 *
 * @param shape gamma shape parameter. `>= 1`이어야 한다.
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 */
const sampleStandardGammaGe1 = (shape: number, rng?: RandomSource): number => {
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);

  for (;;) {
    const x = standardNormal(rng);
    const base = 1 + c * x;
    // v <= 0 iteration은 squeeze용 u를 소비하지 않고 reject한다.
    if (base <= 0) continue;

    const v = base * base * base;
    const u = random(rng);
    const x2 = x * x;
    // 빠른 squeeze: 대부분의 accept를 log 없이 처리한다.
    if (u < 1 - SQUEEZE_CONSTANT * x2 * x2) return d * v;
    // 정확한 acceptance: u === 0이면 log(u) = -Infinity로 항상 accept된다.
    if (Math.log(u) < 0.5 * x2 + d * (1 - v + Math.log(v))) return d * v;
  }
};

/**
 * standard gamma(scale = 1) sample을 반환한다.
 *
 * `shape >= 1`은 Marsaglia-Tsang을 직접 사용한다. `0 < shape < 1`은 boost 변환
 * `gamma(shape + 1, 1, rng) * u ** (1 / shape)`을 사용한다. boost branch는 boosted gamma를 먼저 뽑은 뒤
 * `u = random(rng)`(1회 소비)를 거듭제곱한다. `u === 0`이면 거듭제곱 결과가 `0`이 되며, log 입력이 아니라
 * power 입력이므로 별도 `Number.MIN_VALUE` 보호를 두지 않는다.
 *
 * caller는 `shape > 0`을 보장한다.
 *
 * @param shape gamma shape parameter. `> 0`이어야 한다.
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 */
export const sampleStandardGamma = (shape: number, rng?: RandomSource): number => {
  if (shape < 1) {
    const boosted = sampleStandardGammaGe1(shape + 1, rng);
    const u = random(rng);
    return boosted * u ** (1 / shape);
  }
  return sampleStandardGammaGe1(shape, rng);
};

/**
 * 표준 정규 분포 sample을 반환한다.
 *
 * `multivariateNormal`이 public `standardNormal` leaf를 helper로 직접 import하지 않도록 internal helper에서
 * Box-Muller primitive를 공유한다. `standardNormal`과 동일하게 `rng()`를 2회 소비하며, `u1 <= 0`은
 * `Number.MIN_VALUE`로 보호한다.
 *
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 */
export const sampleStandardNormal = (rng?: RandomSource): number => standardNormal(rng);

/**
 * `values`의 모든 entry가 finite number인지 검증한다.
 *
 * @param label error message에 쓸 collection 이름.
 * @param values 검증할 number array.
 * @throws {RangeError} entry 중 finite number가 아닌 값이 있으면 던진다.
 */
export const assertFiniteVector = (label: string, values: readonly number[]): void => {
  for (let i = 0; i < values.length; i++) {
    const value = values[i] as number;
    if (!Number.isFinite(value)) {
      throw new RangeError(`${label}의 모든 entry는 finite number여야 한다. index ${i}에서 받은 값: ${value}`);
    }
  }
};

/**
 * `covariance`가 `mean`과 호환되는 finite symmetric square matrix인지 검증한다.
 *
 * row 개수와 모든 row length가 `dimension`과 같아야 하고, 모든 entry는 finite number여야 하며,
 * `covariance[i][j] === covariance[j][i]`를 정확히 만족해야 한다. symmetry는 tolerance 없이 정확히
 * 비교하므로 caller는 정확히 대칭인 matrix를 제공해야 한다.
 *
 * @param covariance 검증할 covariance matrix.
 * @param dimension 기대하는 정방 차원(`mean.length`).
 * @throws {RangeError} shape mismatch, non-finite entry, 또는 비대칭이면 던진다.
 */
const assertCovariance = (covariance: readonly (readonly number[])[], dimension: number): void => {
  if (covariance.length !== dimension) {
    throw new RangeError(
      `covariance row 개수는 mean.length(${dimension})와 같아야 한다. 받은 값: ${covariance.length}`
    );
  }
  for (let i = 0; i < dimension; i++) {
    const row = covariance[i] as readonly number[];
    if (row.length !== dimension) {
      throw new RangeError(`covariance row ${i}의 length는 ${dimension}이어야 한다. 받은 값: ${row.length}`);
    }
    for (let j = 0; j < dimension; j++) {
      const value = row[j] as number;
      if (!Number.isFinite(value)) {
        throw new RangeError(`covariance[${i}][${j}]는 finite number여야 한다. 받은 값: ${value}`);
      }
      const mirror = (covariance[j] as readonly number[])[i] as number;
      if (value !== mirror) {
        throw new RangeError(
          `covariance는 symmetric이어야 한다. covariance[${i}][${j}]=${value}, covariance[${j}][${i}]=${mirror}`
        );
      }
    }
  }
};

/**
 * symmetric positive definite covariance의 lower Cholesky factor `L`을 반환한다(`L L^T = covariance`).
 *
 * shape/symmetry는 `assertCovariance`로 먼저 검증한다. diagonal pivot이 `<= 0`이면 positive definite가
 * 아니므로 `RangeError`를 던진다. singular positive semidefinite covariance(pivot `=== 0`)는 이번 범위에서
 * 지원하지 않고 동일하게 던진다.
 *
 * @param covariance symmetric square covariance matrix.
 * @param dimension 정방 차원(`mean.length`).
 * @returns lower triangular factor `L`. 새 `number[][]`.
 * @throws {RangeError} shape mismatch, non-finite entry, 비대칭, 또는 non-positive-definite이면 던진다.
 */
export const choleskyLower = (covariance: readonly (readonly number[])[], dimension: number): number[][] => {
  assertCovariance(covariance, dimension);

  const lower: number[][] = Array.from({ length: dimension }, () => new Array<number>(dimension).fill(0));

  for (let j = 0; j < dimension; j++) {
    let diagonal = (covariance[j] as readonly number[])[j] as number;
    for (let k = 0; k < j; k++) {
      const ljk = (lower[j] as number[])[k] as number;
      diagonal -= ljk * ljk;
    }
    if (!(diagonal > 0)) {
      throw new RangeError(
        'covariance는 positive definite여야 한다. singular 또는 indefinite covariance는 지원하지 않는다'
      );
    }
    const ljj = Math.sqrt(diagonal);
    (lower[j] as number[])[j] = ljj;

    for (let i = j + 1; i < dimension; i++) {
      let sum = (covariance[i] as readonly number[])[j] as number;
      for (let k = 0; k < j; k++) {
        sum -= ((lower[i] as number[])[k] as number) * ((lower[j] as number[])[k] as number);
      }
      (lower[i] as number[])[j] = sum / ljj;
    }
  }

  return lower;
};
