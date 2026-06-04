import { computeMeanWithSquaredSum } from './mean-squared-sum.internal';
import { commitSequenceInto } from './sequence-commit.internal';
import type { StandardizeOptions } from './types';
import { assertValuesArray, assertVarianceMode } from './validate.internal';

/**
 * `values`를 z-score로 변환한 결과를 `out`에 기록한다.
 *
 * 각 entry에 `(value - mean) / standardDeviation`을 적용한다.
 * `values`는 readonly number 배열이어야 한다. array가 아니면 `TypeError`.
 * `options.mode` 기본 `"population"`. `"population"`/`"sample"`이 아니면 `RangeError`이고, 빈 입력이어도
 * mode 검증이 먼저 실행된다(fail-fast).
 * 빈 배열은 `out.length = 0`을 commit하고 `out`을 반환한다(no-op transform). `mode: "sample"`이어도
 * length === 0 분기가 sample 검증보다 먼저 실행되므로 빈 입력은 RangeError가 아니다.
 * `mode: "sample"`에서 `values.length === 1`이면 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`. 누적 sum, centered delta, delta 제곱,
 * 제곱합, variance, standardDeviation, z-score 결과가 non-finite면 `RangeError`.
 * `standardDeviation === 0`이면 같은 길이의 zero vector를 commit한다.
 * validation 또는 계산이 실패하면 `out`은 호출 전 상태 그대로 남는다(모든 산술이 끝난 뒤 commit).
 * `out`과 `values`가 같은 배열이어도 안전하다. 결과의 `-0`은 `0`으로 canonicalize한다.
 * 반환값은 `out`이다.
 *
 * @param out z-score sequence를 기록할 writable storage. 호출 전 length는 무시되고 commit 후 정확한
 *   length(`values.length`)를 갖는다.
 * @param values 표준화할 number 배열. finite entry로만 구성된다.
 * @param options 옵션. `mode` 기본 `"population"`.
 */
export function standardizeInto(out: number[], values: readonly number[], options?: StandardizeOptions): number[] {
  assertValuesArray(values, 'values');
  const mode = options?.mode ?? 'population';
  assertVarianceMode(mode, 'options.mode');

  const length = values.length;
  if (length === 0) {
    out.length = 0;
    return out;
  }
  if (mode === 'sample' && length < 2) {
    throw new RangeError(`sample standardize requires values.length >= 2, got ${length}`);
  }

  const { deltas, squaredSum } = computeMeanWithSquaredSum(values);
  const denominator = mode === 'sample' ? length - 1 : length;
  const varianceValue = squaredSum / denominator;
  if (!Number.isFinite(varianceValue)) {
    throw new RangeError(`variance must be finite, got ${String(varianceValue)}`);
  }
  // variance >= 0 + finite에서 sqrt는 항상 finite. 방어용 가드.
  const stddev = Math.sqrt(varianceValue);
  if (!Number.isFinite(stddev)) {
    throw new RangeError(`standardDeviation must be finite, got ${String(stddev)}`);
  }

  const temp = new Array<number>(length);
  if (stddev === 0) {
    // zero standard deviation → 같은 길이의 zero vector를 반환한다.
    for (let i = 0; i < length; i++) {
      temp[i] = 0;
    }
  } else {
    for (let i = 0; i < length; i++) {
      const z = deltas[i] / stddev;
      if (!Number.isFinite(z)) {
        throw new RangeError(`z-score at index ${i} must be finite, got ${String(z)}`);
      }
      temp[i] = z;
    }
  }

  commitSequenceInto(out, temp);
  return out;
}
