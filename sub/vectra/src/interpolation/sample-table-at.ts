import type { SampleTableOptions } from '../types';
import { assertFiniteNumbers, lookupTable } from './interpolation.internal';

/**
 * 균등 parameter interval의 scalar sample 배열에서 `t` 위치의 값을 반환한다.
 *
 * `t`는 `[0, 1]`을 전체 table 범위로 매핑한다. `t=0`은 첫 sample, `t=1`은 마지막 sample이다.
 *
 * 기본 동작(`extrapolate: false`): `t`를 `[0, 1]`로 clamp한다.
 * `extrapolate: true`: `t < 0`이면 첫 두 sample의 slope로, `t > 1`이면 마지막 두 sample의
 * slope로 선형 외삽한다. 외삽은 `interpolation` 옵션에 관계없이 항상 linear다.
 *
 * degenerate 처리:
 * - `table.length < 1`이면 RangeError.
 * - `t`가 finite하지 않으면 RangeError.
 * - `table` 원소 중 finite하지 않은 값이 있으면 RangeError (전체 scan).
 * - unknown `interpolation` 값이면 RangeError. `table.length === 1`이어도 동일.
 * - `table.length === 1`이면 (extrapolate 여부와 무관하게) 유일한 값을 반환한다.
 *
 * `interpolation: 'nearest'`:
 * - index position을 `Math.round`로 반올림한다.
 * - tie(`.5`)는 큰 index를 선택한다 (JavaScript `Math.round` 동작 그대로).
 *
 * @param table  균등 parameter interval의 scalar sample 배열. 모든 원소가 finite여야 한다.
 * @param t      보간 위치. finite여야 한다. `[0, 1]` 범위 밖은 clamp 또는 외삽한다.
 * @param options  `interpolation` 방법과 `extrapolate` 여부 옵션.
 */
export function sampleTableAt(table: readonly number[], t: number, options?: SampleTableOptions): number {
  if (table.length < 1) {
    throw new RangeError('sampleTableAt: table must have at least one element');
  }

  if (!Number.isFinite(t)) {
    throw new RangeError('sampleTableAt: t must be a finite number');
  }

  assertFiniteNumbers(table);

  const interpolation = options?.interpolation ?? 'linear';
  if (interpolation !== 'linear' && interpolation !== 'nearest') {
    throw new RangeError(`sampleTableAt: unknown interpolation mode "${String(interpolation)}"`);
  }

  return lookupTable(table, t, interpolation, options?.extrapolate ?? false);
}
