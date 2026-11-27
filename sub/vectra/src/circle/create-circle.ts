import { createZeroCircle } from '../internal/circle';
import type { CircleWritable } from '../types/flat-shapes.internal';

/**
 * 원점 (0, 0), radius 0인 zero circle writable을 새로 만든다.
 *
 * 인자를 받지 않는다. `Circle`을 새 plain object로 복사하려면 `circleFrom`을 사용한다.
 */
export function createCircle(): CircleWritable {
  return createZeroCircle();
}
