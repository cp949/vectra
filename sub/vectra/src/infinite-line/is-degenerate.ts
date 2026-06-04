import { readInfiniteLineDirection } from '../internal/infinite-line';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike } from '../types';

/**
 * direction length가 `epsilon` 이하이면 `true`를 반환한다.
 *
 * 비교는 `directionLengthSq <= epsilon * epsilon`으로 수행한다.
 *
 * @param line 검사할 infinite-line
 * @param epsilon direction length 임계값 (기본값 `1e-9`)
 */
export function isDegenerate(line: InfiniteLineLike, epsilon: number = DEFAULT_EPSILON): boolean {
  const dx = readX(readInfiniteLineDirection(line));
  const dy = readY(readInfiniteLineDirection(line));
  return dx * dx + dy * dy <= epsilon * epsilon;
}
