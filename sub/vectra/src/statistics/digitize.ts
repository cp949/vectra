import { digitizeInto } from './digitize-into';
import type { DigitizeOptions } from './types';

/**
 * `values`의 각 entry에 해당하는 bin index를 새 `number[]`로 반환한다.
 *
 * 정책, 실패 분기, inclusivity는 `digitizeInto`와 동일하다. 결과 배열은 fresh `number[]`이며 `-0`은 `0`으로
 * canonicalize한다.
 *
 * @param values 매핑할 finite number 배열. mutate하지 않는다.
 * @param binEdges strictly increasing finite number 경계 배열. mutate하지 않는다.
 * @param options 옵션. 현재 미사용.
 */
export function digitize(values: readonly number[], binEdges: readonly number[], options?: DigitizeOptions): number[] {
  return digitizeInto([], values, binEdges, options);
}
