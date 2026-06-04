import { haltonSequenceInto } from './halton-sequence-into';
import type { HaltonSequenceOptions } from './types';

/**
 * Halton low-discrepancy sequence를 새 `number[][]`로 반환한다.
 *
 * `haltonSequenceInto`의 allocating companion이다. deterministic design sequence이며 `rng`를 소비하지
 * 않는다. outer length는 `count`, 각 row는 `dimension` 길이이고 각 entry는 `[0, 1)` 범위 finite number다.
 * 기본 base는 prime sequence이며, `index === 0`은 모든 dimension에서 `0`이다.
 *
 * @param count 생성할 point 개수. `0 <= count <= 0xffffffff` safe integer. `0`이면 빈 sequence.
 * @param dimension 각 point의 좌표 개수. positive safe integer.
 * @param options startIndex와 custom bases. `startIndex`는 `0 <= startIndex <= 0xffffffff` safe integer(기본 `0`). `bases`는 length가 `dimension` 이상이고 각 base는 safe integer `>= 2`이며 중복이 없어야 한다.
 * @throws {RangeError} count/dimension/startIndex가 범위를 벗어나거나, `startIndex + count - 1`이 `0xffffffff`를 넘거나, bases가 length/정수/중복 조건을 위반하면 던진다.
 */
export const haltonSequence = (count: number, dimension: number, options?: HaltonSequenceOptions): number[][] =>
  haltonSequenceInto([], count, dimension, options);
