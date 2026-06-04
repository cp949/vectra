import { assertPositiveFinite, sampleStandardGamma } from './distribution.internal';
import type { RandomSource } from './random';

/**
 * Dirichlet 분포 sample을 `out`에 기록한다.
 *
 * 각 `alpha[i]`에 대해 `gamma(alpha[i], 1, rng)`을 뽑아 총합으로 normalize한다. 결과 length는
 * `alpha.length`이고, 모든 entry는 `[0, 1]` 범위이며 합은 floating error 허용 범위에서 `1`이다. gamma
 * sample은 `alpha` index 순서대로 소비하며, 각 gamma의 `rng()` 소비 횟수는 shape에 따라 달라진다.
 * `rng()` 반환값은 clamp하거나 normalize하지 않는다.
 *
 * validation과 gamma sampling을 temp array에서 끝낸 뒤 `out.length = 0`과 `push`로 단일 commit한다.
 * 따라서 `out === alpha` aliasing이 안전하고, validation 또는 sampling 실패 시 `out`은 수정하지 않는다.
 * 결과의 `-0`은 `0`으로 canonicalize한다.
 *
 * @param out 결과를 기록할 writable number array. commit 전까지 수정하지 않는다.
 * @param alpha non-empty concentration parameter array. 모든 entry는 `> 0`인 finite number여야 한다.
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {TypeError} alpha가 array가 아닐 때.
 * @throws {RangeError} alpha가 비어 있거나 entry가 finite number가 아니거나 0 이하일 때.
 * @throws {RangeError} gamma 합이 0이거나 non-finite일 때.
 */
export const dirichletInto = <Out extends number[]>(out: Out, alpha: readonly number[], rng?: RandomSource): Out => {
  if (!Array.isArray(alpha)) {
    throw new TypeError(`dirichletInto: alpha는 array여야 한다. 받은 값: ${typeof alpha}`);
  }
  if (alpha.length === 0) {
    throw new RangeError('dirichletInto: alpha는 non-empty array여야 한다');
  }

  // out === alpha aliasing을 위해 검증과 sampling 전에 snapshot을 만든다.
  const snapshot = Array.from(alpha);
  for (let i = 0; i < snapshot.length; i++) {
    assertPositiveFinite(`dirichletInto: alpha[${i}]`, snapshot[i] as number);
  }

  const samples = new Array<number>(snapshot.length);
  let total = 0;
  for (let i = 0; i < snapshot.length; i++) {
    const g = sampleStandardGamma(snapshot[i] as number, rng);
    samples[i] = g;
    total += g;
  }
  if (!Number.isFinite(total) || total <= 0) {
    throw new RangeError('dirichletInto: gamma 합이 0이거나 non-finite다');
  }

  out.length = 0;
  for (let i = 0; i < samples.length; i++) {
    const value = (samples[i] as number) / total;
    out.push(Object.is(value, -0) ? 0 : value);
  }
  return out;
};
