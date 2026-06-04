import { canonicalizeNegativeZero, sortedFiniteCopy } from './order-statistics.internal';

/**
 * `values`에서 빈도가 가장 높은 값을 반환한다.
 *
 * `values`는 readonly number 배열이어야 한다. array가 아니면 `TypeError`. 빈 배열은 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`. ascending sorted copy를 만든 뒤
 * 연속 run의 길이를 비교해 최대 빈도 값을 고른다. 동률(tie)인 경우 sorted ascending 순서에서 가장
 * 먼저 등장하는(즉 더 작은) 값을 반환한다. 결과의 `-0`은 `0`으로 canonicalize한다.
 * input 배열은 mutate하지 않는다.
 *
 * @param values mode를 계산할 number 배열. finite entry로만 구성된다.
 */
export function mode(values: readonly number[]): number {
  const sorted = sortedFiniteCopy(values, 'values');
  const length = sorted.length;
  // `-0`과 `+0`은 IEEE 754에서 `===` 동등이므로 같은 run으로 묶인다. sort comparator
  // `(a,b)=>a-b`도 `-0 - 0 = 0`을 반환해 둘의 상대 위치는 stable sort 기준 입력 순서다.
  // 결과 bestValue가 `-0`이 될 수 있으므로 반환 직전 canonicalize한다.
  let bestValue = sorted[0];
  let bestCount = 1;
  let currentValue = sorted[0];
  let currentCount = 1;
  for (let i = 1; i < length; i++) {
    const value = sorted[i];
    if (value === currentValue) {
      currentCount++;
    } else {
      currentValue = value;
      currentCount = 1;
    }
    // strict >로 비교해 동률에서는 먼저 본 더 작은 값을 유지한다.
    if (currentCount > bestCount) {
      bestCount = currentCount;
      bestValue = currentValue;
    }
  }
  return canonicalizeNegativeZero(bestValue);
}
