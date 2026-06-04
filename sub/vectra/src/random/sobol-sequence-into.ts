import {
  assertDimension,
  assertIndexRangeInBounds,
  assertSequenceCount,
  commitSequence2DInto,
  resolveStartIndex,
  SOBOL_MAX_DIMENSION,
} from './low-discrepancy.internal';
import type { SobolSequenceOptions } from './types';

// 32-bit fixed-point direction number를 [0, 1) float로 만들 때 사용하는 2^32.
const UINT32_RANGE = 0x1_0000_0000;
const DIRECTION_BITS = 32;

// direction vector는 public observable sequence를 결정한다. 임의 변경 금지(API surface / release note 대상).
// dimension 1: van der Corput base-2. direction number m_j = 1, v_j = m_j << (32 - j).
const buildDimension1 = (): number[] => {
  const directions = new Array<number>(DIRECTION_BITS);
  for (let i = 0; i < DIRECTION_BITS; i++) {
    directions[i] = (1 << (31 - i)) >>> 0;
  }
  return directions;
};

// dimension 2: primitive polynomial x + 1. m_1 = 1, m_k = (2 * m_{k-1}) XOR m_{k-1}. v_j = m_j << (32 - j).
const buildDimension2 = (): number[] => {
  const m = new Array<number>(DIRECTION_BITS);
  m[0] = 1;
  for (let i = 1; i < DIRECTION_BITS; i++) {
    const prev = m[i - 1] as number;
    m[i] = ((2 * prev) ^ prev) >>> 0;
  }
  const directions = new Array<number>(DIRECTION_BITS);
  for (let i = 0; i < DIRECTION_BITS; i++) {
    directions[i] = ((m[i] as number) << (31 - i)) >>> 0;
  }
  return directions;
};

const DIRECTIONS: readonly number[][] = [buildDimension1(), buildDimension2()];

// Gray-code 기반 direction vector XOR로 dimension별 좌표를 만든다. index === 0이면 0이다.
const sobolCoordinate = (index: number, directions: number[]): number => {
  const gray = (index ^ (index >>> 1)) >>> 0;
  let acc = 0;
  for (let bit = 0; bit < DIRECTION_BITS; bit++) {
    if ((gray >>> bit) & 1) {
      acc = (acc ^ (directions[bit] as number)) >>> 0;
    }
  }
  return acc / UINT32_RANGE;
};

/**
 * Sobol low-discrepancy sequence를 `out`에 기록한다.
 *
 * deterministic design sequence이며 `rng`를 소비하지 않는다. 각 row는 `dimension` 길이의 새 `number[]`이고
 * 각 entry는 `[0, 1)` 범위 finite number다. `sequence index = startIndex + rowIndex`를 Gray-code 기반
 * direction vector로 변환하며, `index === 0`은 모든 dimension에서 `0`이다.
 *
 * 지원 dimension은 `1 <= dimension <= 2`다. direction number table 없이 정확도 검증이 어려운 dimension은
 * `RangeError`로 닫는다. silent truncation이나 fallback Halton을 쓰지 않는다. direction vector table은 public
 * observable sequence를 결정하므로 변경하면 sequence compatibility가 깨진다.
 *
 * 모든 validation을 통과한 뒤에만 temp sequence를 만들어 단일 commit으로 `out`을 비우고 기록하므로,
 * validation 실패 시 `out`은 호출 전 상태를 유지한다. `-0`은 `0`으로 canonicalize한다.
 *
 * @param out 결과를 기록할 writable storage. 기존 내용은 제거된다.
 * @param count 생성할 point 개수. `0 <= count <= 0xffffffff` safe integer. `0`이면 빈 sequence.
 * @param dimension 각 point의 좌표 개수. `1 <= dimension <= 2` safe integer.
 * @param options startIndex. `0 <= startIndex <= 0xffffffff` safe integer(기본 `0`). seed나 random source가 아니라 row 시작 index만 옮긴다.
 * @throws {RangeError} count/dimension/startIndex가 범위를 벗어나거나, dimension이 `2`를 넘거나, `startIndex + count - 1`이 `0xffffffff`를 넘으면 던진다.
 */
export const sobolSequenceInto = <Out extends number[][]>(
  out: Out,
  count: number,
  dimension: number,
  options?: SobolSequenceOptions
): Out => {
  assertSequenceCount(count);
  assertDimension(dimension, SOBOL_MAX_DIMENSION);
  const startIndex = resolveStartIndex(options?.startIndex);
  assertIndexRangeInBounds(startIndex, count);

  const rows: number[][] = [];
  for (let row = 0; row < count; row++) {
    const index = startIndex + row;
    const point = new Array<number>(dimension);
    for (let d = 0; d < dimension; d++) {
      point[d] = sobolCoordinate(index, DIRECTIONS[d] as number[]);
    }
    rows.push(point);
  }

  return commitSequence2DInto(out, rows);
};
