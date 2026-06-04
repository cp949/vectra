const MAX_COLLECTION_LENGTH = 0xffffffff;

/**
 * `[0, 1]` closed range에서 `count`개의 균등 분포 parameter 값을 `out`에 기록하고 `out`을 반환한다.
 *
 * `count`는 양 끝점 포함 sample point 수이며 2 이상 0xffffffff 이하의 safe integer여야 한다.
 * degenerate 입력(`count < 2`, 비정수, 비유한 값, safe integer 범위 밖)은 `RangeError`를 던진다.
 *
 * `out`은 호출 전에 비워지고 결과가 push된다.
 * validation 실패 시 `out`은 변경되지 않는다.
 *
 * @param out 결과를 기록할 number array. 기존 원소는 clear됨
 * @param count 양 끝점 포함 sample point 수. `2..0xffffffff` safe integer
 */
export function sampleParametersInto(out: number[], count: number): number[] {
  if (!Number.isSafeInteger(count) || count < 2 || count > MAX_COLLECTION_LENGTH) {
    throw new RangeError('sampleParametersInto count must be a safe integer between 2 and 0xffffffff');
  }

  out.length = 0;

  for (let i = 0; i < count - 1; i++) {
    out.push(i / (count - 1));
  }
  // 마지막 값은 부동소수점 누적 오차 방지를 위해 정확히 1을 push
  out.push(1);

  return out;
}
