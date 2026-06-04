import type { RectWritable } from '../types';

/**
 * `(0, 0, 0, 0)` rect를 새 writable object로 만든다.
 *
 * 인자를 받지 않는다. `RectLike`를 새 plain object로 복사하려면 `rectFrom`을 사용한다.
 */
export function createRect(): RectWritable {
  return { x: 0, y: 0, width: 0, height: 0 };
}
