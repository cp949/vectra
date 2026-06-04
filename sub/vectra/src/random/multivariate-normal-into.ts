import { assertFiniteVector, choleskyLower, sampleStandardNormal } from './distribution.internal';
import type { RandomSource } from './random';

/**
 * 다변량 정규 분포 sample을 `out`에 기록한다.
 *
 * `covariance`의 lower Cholesky factor `L`을 구해 `mean + L z`를 기록한다. `z[i] = standardNormal(rng)`로
 * `i = 0 .. mean.length - 1` 순서로 독립 표준정규 vector를 소비한다. `standardNormal`은 Box-Muller라서
 * 한 entry당 `rng()`를 2회 소비한다. `rng()` 반환값은 clamp하거나 normalize하지 않는다.
 *
 * `covariance`는 symmetric positive definite여야 한다. symmetry는 tolerance 없이 정확히 비교한다. singular
 * positive semidefinite covariance는 이번 범위에서 지원하지 않고 `RangeError`를 던진다.
 *
 * validation과 sample 계산을 temp array에서 끝낸 뒤 `out.length = 0`과 `push`로 단일 commit한다. 따라서
 * `out === mean` aliasing이 안전하고, 실패 시 `out`은 수정하지 않는다. 결과의 `-0`은 `0`으로 canonicalize한다.
 *
 * @param out 결과를 기록할 writable number array. commit 전까지 수정하지 않는다.
 * @param mean non-empty mean vector. 모든 entry는 finite number여야 한다.
 * @param covariance `mean.length x mean.length` symmetric positive definite covariance matrix. 모든 entry는 finite number여야 한다.
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {TypeError} mean 또는 covariance가 array가 아닐 때.
 * @throws {RangeError} mean이 비어 있거나 finite number가 아닌 entry를 가질 때.
 * @throws {RangeError} covariance shape이 mean과 맞지 않거나 비대칭이거나 positive definite가 아닐 때.
 * @throws {RangeError} 결과 entry가 non-finite일 때.
 */
export const multivariateNormalInto = <Out extends number[]>(
  out: Out,
  mean: readonly number[],
  covariance: readonly (readonly number[])[],
  rng?: RandomSource
): Out => {
  if (!Array.isArray(mean)) {
    throw new TypeError(`multivariateNormalInto: mean은 array여야 한다. 받은 값: ${typeof mean}`);
  }
  if (!Array.isArray(covariance)) {
    throw new TypeError(`multivariateNormalInto: covariance는 array여야 한다. 받은 값: ${typeof covariance}`);
  }
  if (mean.length === 0) {
    throw new RangeError('multivariateNormalInto: mean은 non-empty array여야 한다');
  }

  const dimension = mean.length;
  // out === mean aliasing을 위해 검증과 계산 전에 snapshot을 만든다.
  const meanSnapshot = Array.from(mean);
  assertFiniteVector('multivariateNormalInto: mean', meanSnapshot);

  const lower = choleskyLower(covariance, dimension);

  const z = new Array<number>(dimension);
  for (let i = 0; i < dimension; i++) {
    z[i] = sampleStandardNormal(rng);
  }

  const result = new Array<number>(dimension);
  for (let i = 0; i < dimension; i++) {
    let value = meanSnapshot[i] as number;
    const row = lower[i] as number[];
    for (let k = 0; k <= i; k++) {
      value += (row[k] as number) * (z[k] as number);
    }
    if (!Number.isFinite(value)) {
      throw new RangeError(`multivariateNormalInto: 결과 entry ${i}가 non-finite다`);
    }
    result[i] = Object.is(value, -0) ? 0 : value;
  }

  out.length = 0;
  for (let i = 0; i < result.length; i++) {
    out.push(result[i] as number);
  }
  return out;
};
