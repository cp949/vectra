import { sampleParametersInto } from './sample-parameters-into';

/**
 * `[0, 1]` closed range에서 `count`개의 균등 분포 parameter 값을 새 배열로 반환한다.
 *
 * `count`는 양 끝점 포함 sample point 수이며 2 이상 0xffffffff 이하의 safe integer여야 한다.
 * degenerate 입력(`count < 2`, 비정수, 비유한 값, safe integer 범위 밖)은 `RangeError`를 던진다.
 *
 * @param count 양 끝점 포함 sample point 수. `2..0xffffffff` safe integer
 */
export function sampleParameters(count: number): number[] {
  return sampleParametersInto([], count);
}
