import type { SampleTableOptions } from '../types';
import { assertFiniteNumbers, lookupTable } from './interpolation.internal';

/**
 * 균등 parameter interval의 scalar sample 표를 한 번 검증해 두고 `t` 위치 값을 조회하는 함수를 반환한다.
 *
 * 반환 함수 `(t) => number`는 같은 table, 같은 options의 `sampleTableAt(table, t, options)`와
 * 같은 값을 반환한다. `sampleTableAt`은 호출마다 table 전체를 finite 검사하지만, 이 함수는 생성할 때
 * 한 번만 검사한다. 같은 table을 여러 번 조회할 때 쓴다. 조회 비용은 table 길이와 무관하다.
 *
 * table은 생성 시점에 복사한다. 이후 원본 배열을 바꿔도 반환 함수는 영향받지 않는다.
 * 반환 함수는 module-level mutable state를 공유하지 않는다. 서로 다른 호출이 만든 두 함수는 독립적이다.
 *
 * degenerate 처리는 `sampleTableAt`과 같다.
 * - `table.length < 1`이면 생성할 때 RangeError.
 * - `table` 원소 중 finite하지 않은 값이 있으면 생성할 때 RangeError.
 * - unknown `interpolation` 값이면 생성할 때 RangeError. `table.length === 1`이어도 동일.
 * - 반환 함수는 `t`가 finite하지 않으면 호출할 때 RangeError.
 * - `table.length === 1`이면 (extrapolate 여부와 무관하게) 유일한 값을 반환한다.
 *
 * `t`는 `[0, 1]`을 전체 table 범위로 매핑한다. 기본 동작(`extrapolate: false`)은 `t`를 `[0, 1]`로
 * clamp한다. `extrapolate: true`이면 첫 두 sample 또는 마지막 두 sample의 slope로 선형 외삽한다.
 * `interpolation: 'nearest'`의 tie(`.5`)는 큰 index를 선택한다.
 *
 * @param table 균등 parameter interval의 scalar sample 배열. 모든 원소가 finite여야 한다.
 * @param options `interpolation` 방법과 `extrapolate` 여부 옵션.
 */
export function createTableSampler(table: readonly number[], options?: SampleTableOptions): (t: number) => number {
  if (table.length < 1) {
    throw new RangeError('createTableSampler: table must have at least one element');
  }

  assertFiniteNumbers(table);

  const interpolation = options?.interpolation ?? 'linear';
  if (interpolation !== 'linear' && interpolation !== 'nearest') {
    throw new RangeError(`createTableSampler: unknown interpolation mode "${String(interpolation)}"`);
  }

  const extrapolate = options?.extrapolate ?? false;
  const samples = Float64Array.from(table);

  return (t: number): number => {
    if (!Number.isFinite(t)) {
      throw new RangeError('createTableSampler: t must be a finite number');
    }

    return lookupTable(samples, t, interpolation, extrapolate);
  };
}
