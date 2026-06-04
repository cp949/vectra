import { multivariateNormalInto } from './multivariate-normal-into';
import type { RandomSource } from './random';

/**
 * 다변량 정규 분포 sample을 새 `number[]`로 반환한다.
 *
 * `covariance`의 lower Cholesky factor `L`을 구해 `mean + L z`를 반환한다. `z[i] = standardNormal(rng)`로
 * `i = 0 .. mean.length - 1` 순서로 독립 표준정규 vector를 소비한다. `standardNormal`은 Box-Muller라서
 * 한 entry당 `rng()`를 2회 소비한다. `rng()` 반환값은 clamp하거나 normalize하지 않는다.
 *
 * `covariance`는 symmetric positive definite여야 한다. symmetry는 tolerance 없이 정확히 비교한다. singular
 * positive semidefinite covariance는 이번 범위에서 지원하지 않고 `RangeError`를 던진다. 결과의 `-0`은
 * `0`으로 canonicalize한다.
 *
 * @param mean non-empty mean vector. 모든 entry는 finite number여야 한다.
 * @param covariance `mean.length x mean.length` symmetric positive definite covariance matrix. 모든 entry는 finite number여야 한다.
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {TypeError} mean 또는 covariance가 array가 아닐 때.
 * @throws {RangeError} mean이 비어 있거나 finite number가 아닌 entry를 가질 때.
 * @throws {RangeError} covariance shape이 mean과 맞지 않거나 비대칭이거나 positive definite가 아닐 때.
 * @throws {RangeError} 결과 entry가 non-finite일 때.
 */
export const multivariateNormal = (
  mean: readonly number[],
  covariance: readonly (readonly number[])[],
  rng?: RandomSource
): number[] => multivariateNormalInto([], mean, covariance, rng);
