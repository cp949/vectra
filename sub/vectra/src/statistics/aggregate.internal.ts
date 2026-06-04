import { assertValuesArray } from './validate.internal';

/**
 * `values`가 비어 있지 않은 finite number 배열인지 검증한다.
 *
 * `values`가 array가 아니면 `TypeError`. 빈 배열이면 `RangeError`. entry가 finite가 아니면
 * `RangeError`. caller는 검증 후 min/max/range 단일 패스 산술을 진행한다. 누적 overflow가
 * 발생할 수 있는 `sum`/`product`는 entry-finite 검증을 산술과 인라인으로 묶어 호출하지 않는다.
 *
 * @param values 검증할 number 배열
 * @param name error message에 사용할 인자 이름. 기본 `"values"`.
 */
export function assertNonEmptyFiniteValues(values: readonly number[], name = 'values'): void {
  assertValuesArray(values, name);
  const length = values.length;
  if (length === 0) {
    throw new RangeError(`${name} must not be empty`);
  }
  for (let i = 0; i < length; i++) {
    const value = values[i];
    if (!Number.isFinite(value)) {
      throw new RangeError(`${name}[${i}] must be a finite number, got ${String(value)}`);
    }
  }
}
