import { createZeroBounds } from '../internal/bounds';
import type { BoundsWritable } from '../types/flat-shapes.internal';

/**
 * 원점에 수렴한 zero bounds writable을 새로 만든다.
 *
 * 인자를 받지 않는다. `Bounds`를 새 plain object로 복사하려면 `boundsFrom`을 사용한다.
 */
export function createBounds(): BoundsWritable {
  return createZeroBounds();
}
