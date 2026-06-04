import { assertExplicitRange, scanFiniteMinMax } from './histogram.internal';
import { commitSequenceInto } from './sequence-commit.internal';
import type { NormalizeMinMaxOptions } from './types';
import { assertValuesArray } from './validate.internal';

const DEFAULT_TARGET_MIN = 0;
const DEFAULT_TARGET_MAX = 1;

/**
 * `values`를 `[targetMin, targetMax]` 구간으로 선형 정규화한 결과를 `out`에 기록한다.
 *
 * 각 entry는 `(value - inputMin) / (inputMax - inputMin) * (targetMax - targetMin) + targetMin`을 적용한다.
 *
 * `values`는 readonly number 배열이어야 한다. array가 아니면 `TypeError`. 옵션 검증은 빈 입력에서도 fail-fast다.
 *
 * `options.range` 기본 `[0, 1]`. tuple은 length 2 + entry finite + `targetMin < targetMax`이어야 한다. 위반 시
 * `RangeError`(top-level이 array가 아니거나 entry가 number가 아니면 `TypeError`).
 *
 * 빈 배열은 `out.length = 0`을 commit하고 `out`을 반환한다(no-op transform).
 *
 * `values.length === 1` 또는 `max === min`(zero input range)이면 같은 길이로 `targetMin`을 채운다(`standardize`의
 * zero stddev → `0` fill과는 정의역이 다르다).
 *
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`. 누적 min/max scan, span, scaled 결과가 non-finite면
 * `RangeError`. validation 또는 산술 실패 시 `out`은 호출 전 상태 그대로 남는다(모든 산술이 끝난 뒤 단일 commit).
 * `out`과 `values`가 같은 배열이어도 안전하다. 결과의 `-0`은 `0`으로 canonicalize한다. 반환값은 `out`이다.
 *
 * @param out 정규화 결과를 기록할 writable storage. 호출 전 length는 무시되고 commit 후 `values.length`를 가진다.
 * @param values 정규화할 finite number 배열. mutate하지 않는다.
 * @param options 옵션. `range` 기본 `[0, 1]`.
 */
export function normalizeMinMaxInto(
  out: number[],
  values: readonly number[],
  options?: NormalizeMinMaxOptions
): number[] {
  assertValuesArray(values, 'values');

  let targetMin = DEFAULT_TARGET_MIN;
  let targetMax = DEFAULT_TARGET_MAX;
  if (options?.range !== undefined) {
    // assertExplicitRange는 length === 2 + finite + min < max를 검증한다(histogram과 정책 공유).
    assertExplicitRange(options.range, 'options.range');
    targetMin = options.range[0];
    targetMax = options.range[1];
  }

  const length = values.length;
  if (length === 0) {
    out.length = 0;
    return out;
  }

  const { min, max } = scanFiniteMinMax(values, 'values');
  const temp = new Array<number>(length);

  if (max === min) {
    // zero input range(`length === 1`도 max === min): 같은 길이로 targetMin을 채운다.
    temp.fill(targetMin);
    commitSequenceInto(out, temp);
    return out;
  }

  // max === min은 위에서 early-return으로 처리됐고 IEEE 754 빼기는 두 finite의 strict 비교 결과를 부호로 보존하므로
  // inputSpan > 0이 자동 성립한다. finite 가드만 남겨 `MAX_VALUE - (-MAX_VALUE)` 같은 overflow를 잡는다.
  const inputSpan = max - min;
  if (!Number.isFinite(inputSpan)) {
    throw new RangeError(`normalizeMinMax input span must be finite, got ${String(inputSpan)}`);
  }
  const outputSpan = targetMax - targetMin;
  if (!Number.isFinite(outputSpan)) {
    throw new RangeError(`normalizeMinMax output span must be finite, got ${String(outputSpan)}`);
  }
  const scale = outputSpan / inputSpan;
  if (!Number.isFinite(scale)) {
    throw new RangeError(`normalizeMinMax scale factor must be finite, got ${String(scale)}`);
  }

  for (let i = 0; i < length; i++) {
    const delta = values[i] - min;
    if (!Number.isFinite(delta)) {
      throw new RangeError(`normalizeMinMax delta at index ${i} must be finite, got ${String(delta)}`);
    }
    const scaled = delta * scale + targetMin;
    if (!Number.isFinite(scaled)) {
      throw new RangeError(`normalizeMinMax result at index ${i} must be finite, got ${String(scaled)}`);
    }
    temp[i] = scaled;
  }

  commitSequenceInto(out, temp);
  return out;
}
