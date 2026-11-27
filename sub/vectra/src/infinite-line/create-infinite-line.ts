import type { InfiniteLineWritable } from '../types/flat-shapes.internal';

/**
 * `ox`, `oy`, `dx`, `dy`가 모두 0인 degenerate infinite-line writable을 새로 만든다.
 *
 * 인자를 받지 않는다. `InfiniteLine`을 새 plain object로 복사하려면 `infiniteLineFrom`을
 * 사용한다.
 */
export function createInfiniteLine(): InfiniteLineWritable {
  return { ox: 0, oy: 0, dx: 0, dy: 0 };
}
