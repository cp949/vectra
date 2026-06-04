import type { VecWritable } from './types';

/**
 * temp vector를 `out`에 commit한다.
 *
 * caller가 입력 검증과 finite result 검증을 끝낸 뒤 호출한다.
 * `out` capacity가 부족하면 `RangeError`를 던지고 `out`은 호출 전 상태 그대로 남는다.
 *
 * @param out 결과를 commit할 writable vector
 * @param temp commit할 source vector
 * @param length commit할 entry 개수
 * @param name error message에 사용할 `out` 인자 이름
 */
export function commitVectorInto(out: VecWritable, temp: readonly number[], length: number, name: string): void {
  if (out.length < length) {
    throw new RangeError(`${name} capacity (${out.length}) is less than vector length (${length})`);
  }
  for (let i = 0; i < length; i++) {
    out[i] = temp[i];
  }
  out.length = length;
}
