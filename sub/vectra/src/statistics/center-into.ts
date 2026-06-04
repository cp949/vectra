import { commitSequenceInto } from './sequence-commit.internal';
import { assertValuesArray, sumFiniteValues } from './validate.internal';

/**
 * `values`에서 평균을 뺀 centered 배열을 `out`에 기록한다.
 *
 * `values`는 readonly number 배열이어야 한다. array가 아니면 `TypeError`. 빈 배열은 `out.length = 0`을
 * commit하고 `out`을 반환한다(no-op transform). 비어 있지 않은 경우 모든 entry는 finite number여야 한다.
 * 위반 시 `RangeError`. 누적 sum이나 centered delta가 non-finite면 `RangeError`.
 * validation 또는 계산이 실패하면 `out`은 호출 전 상태 그대로 남는다(모든 산술이 끝난 뒤 commit).
 * `out`과 `values`가 같은 배열이어도 안전하다. 결과의 `-0`은 `0`으로 canonicalize한다.
 * 반환값은 `out`이다.
 *
 * @param out centered 결과를 기록할 writable storage. 호출 전 length는 무시되고 commit 후 정확한
 *   length(`values.length`)를 갖는다.
 * @param values centered 배열을 계산할 number 배열. finite entry로만 구성된다.
 */
export function centerInto(out: number[], values: readonly number[]): number[] {
  assertValuesArray(values, 'values');
  const length = values.length;
  if (length === 0) {
    out.length = 0;
    return out;
  }

  const sum = sumFiniteValues(values);
  // length >= 1 + sum finite에서 result는 항상 finite. 방어용 가드.
  const meanValue = sum / length;
  if (!Number.isFinite(meanValue)) {
    throw new RangeError(`mean must be finite, got ${String(meanValue)}`);
  }

  const temp = new Array<number>(length);
  for (let i = 0; i < length; i++) {
    const delta = values[i] - meanValue;
    if (!Number.isFinite(delta)) {
      throw new RangeError(`centered entry at index ${i} must be finite, got ${String(delta)}`);
    }
    temp[i] = delta;
  }

  commitSequenceInto(out, temp);
  return out;
}
