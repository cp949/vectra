import type { InfiniteLineLike, InfiniteLineWritable } from '../types';
import { createInfiniteLine } from './create-infinite-line';
import { reverseInto } from './reverse-into';

/** `direction` 부호를 반전한 새 plain object를 반환한다. `origin`은 유지한다. */
export function reverse(line: InfiniteLineLike): InfiniteLineWritable {
  return reverseInto(createInfiniteLine(), line);
}
