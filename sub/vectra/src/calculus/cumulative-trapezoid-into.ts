import { commitSequenceInto } from './sequence-commit.internal';
import {
  assertPositiveFiniteSpacing,
  assertValuesEntriesFinite,
  assertValuesIsArray,
} from './sequence-validate.internal';

/**
 * 균등 spacing sequence `values`의 cumulative trapezoidal partial sum을 `out`에 기록한다.
 *
 * `values`는 array여야 한다. array가 아니면 `TypeError`.
 * `spacing` 미지정 시 기본 `1`. 지정 시 positive finite number여야 한다. 위반 시 `RangeError`.
 * positive denormal에서 `spacing * 0.5`가 `+0`으로 double-rounding underflow되면 누적이 silent
 * zero가 되므로 별도 `RangeError`로 거부한다(`secondDerivativeInto`의 `dxSquared === 0` guard와
 * 일관).
 * `values`의 모든 entry는 finite number여야 한다. 위반 시 `RangeError`. 검증은 산술 시작 전에
 * 끝낸다.
 * `values.length === 0`은 `[]`. `values.length === 1`은 `[0]`(single sample은 trapezoidal 구간이
 * 없으므로 시작 누적값만 기록).
 * `values.length >= 2`에서는 length가 `values.length`인 sequence를 만든다.
 * `result[0] = 0`, `result[i] = result[i-1] + (values[i-1] + values[i]) * spacing / 2`.
 * 모든 partial sum과 매 증분(`(values[i-1] + values[i]) * spacing * 0.5`)이 finite여야 한다.
 * 위반 시 `RangeError`. 결과 entry의 `-0`은 `0`으로 canonicalize한다.
 * validation 또는 계산이 실패하면 `out`은 호출 전 상태 그대로 남는다(모든 산술이 끝난 뒤 commit).
 * `out === values` aliasing도 안전하다. 산술은 fresh temp array에서 끝낸 뒤 commit하므로
 * `values` 읽기가 끝난 다음에 `out`을 수정한다.
 *
 * @param out cumulative sequence를 기록할 writable storage. commit 후 정확한 length(`values.length`)를 갖는다.
 * @param values 누적 trapezoidal 합산을 적용할 sequence. 호출 후에도 mutate되지 않는다(단 `out`과 같은 instance면 commit에 의해 덮어쓰여진다).
 * @param spacing sample 간 dx. 기본 `1`. positive finite number.
 */
export function cumulativeTrapezoidInto(out: number[], values: readonly number[], spacing?: number): number[] {
  assertValuesIsArray(values, 'values');
  if (spacing !== undefined) {
    assertPositiveFiniteSpacing(spacing, 'spacing');
  }
  assertValuesEntriesFinite(values, 'values');

  const n = values.length;
  if (n === 0) {
    out.length = 0;
    return out;
  }

  const dx = spacing ?? 1;
  // dx는 positive finite이지만 dx * 0.5는 denormal 영역에서 underflow로 +0이 될 수 있다.
  // halfDx === 0이면 모든 증분이 0이 되어 silent zero sequence를 만들므로 거부한다.
  const halfDx = dx * 0.5;
  if (halfDx === 0) {
    throw new RangeError(`spacing * 0.5 underflowed to 0, got spacing=${String(dx)}`);
  }
  const temp = new Array<number>(n);
  temp[0] = 0;
  for (let i = 1; i < n; i++) {
    const inc = (values[i - 1] + values[i]) * halfDx;
    if (!Number.isFinite(inc)) {
      throw new RangeError(`trapezoidal increment at index ${i} must be finite, got ${String(inc)}`);
    }
    const next = temp[i - 1] + inc;
    if (!Number.isFinite(next)) {
      throw new RangeError(`cumulative trapezoid partial sum at index ${i} must be finite, got ${String(next)}`);
    }
    temp[i] = next;
  }

  commitSequenceInto(out, temp);
  return out;
}
