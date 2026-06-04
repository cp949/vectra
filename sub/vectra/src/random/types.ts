/**
 * `haltonSequence`/`haltonSequenceInto`의 옵션.
 *
 * 이 helper는 deterministic low-discrepancy sequence이며 `rng`를 소비하지 않는다. 같은 옵션과 같은
 * `count`/`dimension`은 항상 같은 sequence를 만든다.
 */
export interface HaltonSequenceOptions {
  /**
   * sequence를 시작할 index. `0 <= startIndex <= 0xffffffff` safe integer여야 한다. 기본 `0`.
   * `rowIndex`의 실제 sequence index는 `startIndex + rowIndex`다. seed나 random source가 아니다.
   */
  readonly startIndex?: number;

  /**
   * dimension별 radical inverse base. 생략하면 dimension 순서대로 prime number를 사용한다.
   * 제공 시 length는 `dimension` 이상이어야 하고, 각 base는 safe integer `>= 2`이며 중복이 없어야 한다.
   * 중복 base는 dimension 간 같은 sequence를 만들어 low-discrepancy 품질을 해친다.
   */
  readonly bases?: readonly number[];
}

/**
 * `sobolSequence`/`sobolSequenceInto`의 옵션.
 *
 * 이 helper는 deterministic low-discrepancy sequence이며 `rng`를 소비하지 않는다. 같은 옵션과 같은
 * `count`/`dimension`은 항상 같은 sequence를 만든다. 지원 dimension은 `1 <= dimension <= 2`다.
 */
export interface SobolSequenceOptions {
  /**
   * sequence를 시작할 index. `0 <= startIndex <= 0xffffffff` safe integer여야 한다. 기본 `0`.
   * `rowIndex`의 실제 sequence index는 `startIndex + rowIndex`다. seed나 random source가 아니다.
   */
  readonly startIndex?: number;
}
