import { normalizeMinMaxInto } from './normalize-min-max-into';
import type { NormalizeMinMaxOptions } from './types';

/**
 * `values`를 `[targetMin, targetMax]` 구간으로 선형 정규화한 결과를 새 `number[]`로 반환한다.
 *
 * 정책, validation, zero input range 처리, 실패 분기는 `normalizeMinMaxInto`와 동일하다. 빈 입력은 `[]`을 반환한다
 * (no-op transform). 결과의 `-0`은 `0`으로 canonicalize한다.
 *
 * @param values 정규화할 finite number 배열. mutate하지 않는다.
 * @param options 옵션. `range` 기본 `[0, 1]`.
 */
export function normalizeMinMax(values: readonly number[], options?: NormalizeMinMaxOptions): number[] {
  return normalizeMinMaxInto([], values, options);
}
