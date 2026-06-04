/**
 * value가 2의 거듭제곱인지 반환한다.
 *
 * 0과 음수, 비정수, non-safe integer는 모두 false를 반환한다. 판정 가능한 양의 입력은
 * 1부터 2^52까지의 safe integer이다.
 *
 * @param value 판정할 정수 값
 */
export function isPowerOfTwo(value: number): boolean {
  if (!Number.isSafeInteger(value) || value <= 0) return false;

  // 비트 트릭 `(v & (v - 1)) === 0`은 JS의 32-bit 정수 강제 변환 때문에
  // value > 2^31에서 잘못된 결과를 낸다. safe integer 전체 범위(최대 2^53 - 1)를
  // 다루기 위해 2로 반복 분할해 판정한다. 안전한 정수의 2 분할은 정밀도 손실이 없다.
  while (value > 1) {
    if (value % 2 !== 0) return false;
    value /= 2;
  }

  return true;
}
