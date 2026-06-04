/**
 * low-discrepancy sequence helper(`haltonSequence*`, `sobolSequence*`)가 공유하는 validation,
 * output commit, index 정책.
 *
 * 모든 helper는 deterministic sequence이며 `rng`를 소비하지 않는다. validation 실패 시 caller의 `out`을
 * 수정하지 않도록, 산출 sequence는 temp `number[][]`로 만든 뒤 단일 commit으로 기록한다.
 */

/** `count`와 index의 상한. uint32 상한과 같다. */
const MAX_INDEX = 0xffffffff;

/** Sobol이 direction number table 없이 검증 가능한 dimension 상한. */
export const SOBOL_MAX_DIMENSION = 2;

/**
 * `count`가 `0 <= count <= 0xffffffff` safe integer인지 검증한다.
 *
 * @param count 생성할 point 개수.
 * @throws {RangeError} count가 유효한 범위의 safe integer가 아니면 던진다.
 */
export const assertSequenceCount = (count: number): void => {
  if (!Number.isSafeInteger(count) || count < 0 || count > MAX_INDEX) {
    throw new RangeError('count must be a safe integer between 0 and 0xffffffff');
  }
};

/**
 * `dimension`이 positive safe integer인지 검증한다. 상한이 있으면 함께 검증한다.
 *
 * @param dimension 각 point의 좌표 개수.
 * @param maxDimension 지원하는 dimension 상한. 생략하면 상한 검증을 하지 않는다.
 * @throws {RangeError} dimension이 positive safe integer가 아니거나 상한을 넘으면 던진다.
 */
export const assertDimension = (dimension: number, maxDimension?: number): void => {
  if (!Number.isSafeInteger(dimension) || dimension < 1) {
    throw new RangeError('dimension must be a positive safe integer');
  }
  if (maxDimension !== undefined && dimension > maxDimension) {
    throw new RangeError(`dimension must not exceed ${maxDimension}`);
  }
};

/**
 * `options.startIndex`를 검증해 정규화한다. 미지정이면 `0`을 사용한다.
 *
 * @param startIndex 검증할 startIndex. `undefined`이면 기본 `0`.
 * @returns 정규화된 startIndex.
 * @throws {RangeError} startIndex가 `0 <= startIndex <= 0xffffffff` safe integer가 아니면 던진다.
 */
export const resolveStartIndex = (startIndex: number | undefined): number => {
  if (startIndex === undefined) return 0;
  if (!Number.isSafeInteger(startIndex) || startIndex < 0 || startIndex > MAX_INDEX) {
    throw new RangeError('startIndex must be a safe integer between 0 and 0xffffffff');
  }
  return startIndex;
};

/**
 * `startIndex + count - 1`이 uint32 상한을 넘지 않는지 검증한다. `count === 0`이면 검증하지 않는다.
 *
 * @param startIndex 정규화된 시작 index.
 * @param count 생성할 point 개수.
 * @throws {RangeError} 마지막 index가 `0xffffffff`를 넘으면 던진다.
 */
export const assertIndexRangeInBounds = (startIndex: number, count: number): void => {
  if (count === 0) return;
  if (startIndex + count - 1 > MAX_INDEX) {
    throw new RangeError('startIndex + count - 1 must not exceed 0xffffffff');
  }
};

/**
 * 계산이 끝난 point 행렬을 `out`에 commit한다.
 *
 * 모든 validation과 산출이 끝난 뒤 단 한 번 호출해 `out`을 비우고 결과 row를 push한다. caller는 `rows`의
 * 각 row가 새 `number[]`이고 모든 entry가 `[0, 1)` finite number임을 보장한다. `-0`은 `0`으로
 * canonicalize해 기록한다.
 *
 * @param out 결과를 기록할 writable storage. 기존 내용은 제거된다.
 * @param rows commit할 point 행렬. 각 row는 그대로 `out`에 push한다.
 */
export const commitSequence2DInto = <Out extends number[][]>(out: Out, rows: number[][]): Out => {
  out.length = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] as number[];
    for (let j = 0; j < row.length; j++) {
      if (Object.is(row[j], -0)) row[j] = 0;
    }
    out.push(row);
  }
  return out;
};
