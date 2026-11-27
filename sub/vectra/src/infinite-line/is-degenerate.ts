import { DEFAULT_EPSILON } from '../internal/numeric';
import type { InfiniteLine } from '../types/flat-shapes.internal';

/**
 * direction length가 `epsilon` 이하이면 `true`를 반환한다.
 *
 * 비교는 `directionLengthSq <= epsilon * epsilon`으로 수행한다.
 *
 * @param line 검사할 infinite-line
 * @param epsilon direction length 임계값 (기본값 `1e-9`)
 */
export function isDegenerate(line: InfiniteLine, epsilon: number = DEFAULT_EPSILON): boolean {
  const { dx, dy } = line;
  return dx * dx + dy * dy <= epsilon * epsilon;
}
