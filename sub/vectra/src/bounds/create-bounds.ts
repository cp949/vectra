import type { BoundsWritable } from '../types';

/**
 * 원점에 수렴한 zero bounds writable을 새로 만든다.
 *
 * 인자를 받지 않는다. `BoundsLike`를 새 plain object로 복사하려면 `boundsFrom`을 사용한다.
 */
export function createBounds(): BoundsWritable {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}
