import type { NormOptions, VecLike, VecWritable } from './types';
import { assertFiniteVector, assertValidPNorm } from './validate.internal';

/**
 * vector를 `options.p`(미지정 시 Euclidean) norm으로 정규화한 결과를 `out`에 기록한다.
 *
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.p`를 지정하면 `p >= 1` finite number여야 한다. 위반 시 `RangeError`.
 * `out.length`가 vector 길이보다 작으면 `RangeError`를 던지고 `out`은 수정하지 않는다.
 * norm이 `0`이면 `false`를 반환하고 `out`은 수정하지 않는다(zero vector).
 * 성공 시 `out.length`는 vector 길이로 truncate되고 `true`를 반환한다.
 * `out`은 `vector`와 같은 array여도 안전하다(scalar norm을 먼저 계산한 뒤 in-place로 나눈다).
 * overflow/underflow에 강건하도록 max scaling 방식을 사용한다.
 *
 * @param out 정규화 결과를 기록할 writable vector
 * @param vector 정규화할 vector
 * @param options norm 계산 옵션. `p` 미지정 시 Euclidean norm 사용.
 */
export function normalizeInto(out: VecWritable, vector: VecLike, options?: NormOptions): boolean {
  const p = options?.p;
  if (p !== undefined) {
    assertValidPNorm(p);
  }
  assertFiniteVector(vector, 'vector');
  if (out.length < vector.length) {
    throw new RangeError(`out capacity (${out.length}) is less than vector length (${vector.length})`);
  }
  const n = vector.length;
  let max = 0;
  for (let i = 0; i < n; i++) {
    const a = Math.abs(vector[i]);
    if (a > max) {
      max = a;
    }
  }
  if (max === 0) {
    return false;
  }
  let scaledNorm: number;
  if (p === undefined) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const s = vector[i] / max;
      sum += s * s;
    }
    scaledNorm = Math.sqrt(sum);
  } else {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += (Math.abs(vector[i]) / max) ** p;
    }
    scaledNorm = sum ** (1 / p);
  }
  // (vector[i] / max) / scaledNorm 두 단계로 나눠 `max * scaledNorm`이 Infinity로 overflow하는
  // huge magnitude 입력에서도 finite 단위 벡터를 만들 수 있다.
  for (let i = 0; i < n; i++) {
    out[i] = vector[i] / max / scaledNorm;
  }
  out.length = n;
  return true;
}
