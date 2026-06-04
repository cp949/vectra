import { cumulativeTrapezoidInto } from './cumulative-trapezoid-into';

/**
 * 균등 spacing sequence `values`의 cumulative trapezoidal partial sum을 새 `number[]`로 반환한다.
 *
 * `values`는 array여야 한다. array가 아니면 `TypeError`.
 * `spacing` 미지정 시 기본 `1`. 지정 시 positive finite number여야 한다. 위반 시 `RangeError`.
 * positive denormal에서 `spacing * 0.5`가 `+0`으로 underflow되면 silent zero sequence가 되므로
 * 별도 `RangeError`로 거부한다.
 * `values`의 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `values.length === 0`은 `[]`. `values.length === 1`은 `[0]`.
 * `values.length >= 2`에서는 length가 `values.length`인 sequence를 만든다.
 * `result[0] = 0`, `result[i] = result[i-1] + (values[i-1] + values[i]) * spacing / 2`.
 * 모든 partial sum과 매 증분이 finite여야 한다. 위반 시 `RangeError`. 결과 entry의 `-0`은
 * `0`으로 canonicalize한다.
 *
 * @param values 누적 trapezoidal 합산을 적용할 sequence. 호출 후에도 mutate되지 않는다.
 * @param spacing sample 간 dx. 기본 `1`. positive finite number.
 */
export function cumulativeTrapezoid(values: readonly number[], spacing?: number): number[] {
  return cumulativeTrapezoidInto([], values, spacing);
}
