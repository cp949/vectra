import { normalizeInto } from './normalize-into';
import type { NormOptions, VecLike } from './types';

/**
 * vector를 `options.p`(미지정 시 Euclidean) norm으로 정규화한 새 `number[]`를 반환한다.
 *
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.p`를 지정하면 `p >= 1` finite number여야 한다. 위반 시 `RangeError`.
 * norm이 `0`이면 `undefined`를 반환한다(zero vector).
 * overflow/underflow에 강건하도록 max scaling 방식을 사용한다.
 *
 * @param vector 정규화할 vector
 * @param options norm 계산 옵션. `p` 미지정 시 Euclidean norm 사용.
 */
export function normalize(vector: VecLike, options?: NormOptions): number[] | undefined {
  const out: number[] = new Array(vector.length);
  return normalizeInto(out, vector, options) ? out : undefined;
}
