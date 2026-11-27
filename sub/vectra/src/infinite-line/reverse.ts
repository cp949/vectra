import type { InfiniteLine, InfiniteLineWritable } from '../types/flat-shapes.internal';
import { reverseInto } from './reverse-into';

/** `direction` 부호를 반전한 새 plain object를 반환한다. `origin`은 유지한다. */
export function reverse(line: InfiniteLine): InfiniteLineWritable {
  return reverseInto({ ox: 0, oy: 0, dx: 0, dy: 0 }, line);
}
