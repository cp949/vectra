import { sobolSequenceInto } from './sobol-sequence-into';
import type { SobolSequenceOptions } from './types';

/**
 * Sobol low-discrepancy sequence를 새 `number[][]`로 반환한다.
 *
 * `sobolSequenceInto`의 allocating companion이다. deterministic design sequence이며 `rng`를 소비하지
 * 않는다. outer length는 `count`, 각 row는 `dimension` 길이이고 각 entry는 `[0, 1)` 범위 finite number다.
 * 지원 dimension은 `1 <= dimension <= 2`이며, `index === 0`은 모든 dimension에서 `0`이다.
 *
 * @param count 생성할 point 개수. `0 <= count <= 0xffffffff` safe integer. `0`이면 빈 sequence.
 * @param dimension 각 point의 좌표 개수. `1 <= dimension <= 2` safe integer.
 * @param options startIndex. `0 <= startIndex <= 0xffffffff` safe integer(기본 `0`). seed나 random source가 아니라 row 시작 index만 옮긴다.
 * @throws {RangeError} count/dimension/startIndex가 범위를 벗어나거나, dimension이 `2`를 넘거나, `startIndex + count - 1`이 `0xffffffff`를 넘으면 던진다.
 */
export const sobolSequence = (count: number, dimension: number, options?: SobolSequenceOptions): number[][] =>
  sobolSequenceInto([], count, dimension, options);
