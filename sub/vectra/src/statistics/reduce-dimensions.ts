import { reduceDimensionsInto } from './reduce-dimensions-into';
import type { DimensionReductionOptions } from './types';

/**
 * `data`의 PCA projection을 새 `number[][]`로 반환한다.
 *
 * validation, orientation 정책, denominator 정책, projection 계산, decomposition 실패 처리는
 * `reduceDimensionsInto`와 동일하다. 결과 matrix는 항상 row=observation, column=component shape이고
 * 각 entry의 `-0`은 `0`으로 canonicalize한다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `reduceDimensionsInto`와 동일하다.
 * tolerance/iteration option 정책은 `reduceDimensionsInto`와 동일하다.
 * @param data projection 대상 matrix. row-major rectangular finite number matrix.
 * @param options 옵션. `dimensions` 필수. 그 외 옵션은 `PCAOptions`와 동일하다.
 */
export function reduceDimensions(data: readonly (readonly number[])[], options: DimensionReductionOptions): number[][] {
  return reduceDimensionsInto([], data, options);
}
