/**
 * 계산이 끝난 finite number 배열을 `out`에 commit한다.
 *
 * 모든 validation과 산술이 끝난 뒤 단 한 번 호출해 `out`을 비우고 결과를 push한다. caller는 호출 전
 * `values`의 모든 entry가 finite임을 보장한다. 결과의 `-0`은 `0`으로 canonicalize해 기록한다.
 *
 * @param out 결과를 기록할 writable storage
 * @param values commit할 finite number 배열
 */
export function commitSequenceInto(out: number[], values: readonly number[]): void {
  out.length = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    out.push(Object.is(value, -0) ? 0 : value);
  }
}
