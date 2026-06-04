import { centerInto } from './center-into';

/**
 * `values`에서 평균을 뺀 centered 배열을 새 `number[]`로 반환한다.
 *
 * `values`는 readonly number 배열이어야 한다. array가 아니면 `TypeError`. 빈 배열은 `[]`을 반환한다.
 * 비어 있지 않은 경우 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 누적 sum이나 centered delta가 non-finite면 `RangeError`. 결과의 `-0`은 `0`으로 canonicalize한다.
 *
 * @param values centered 배열을 계산할 number 배열. finite entry로만 구성된다.
 */
export function center(values: readonly number[]): number[] {
  return centerInto([], values);
}
