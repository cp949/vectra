import type { CircleWritable } from '../types';

/**
 * 원점 (0, 0), radius 0인 zero circle writable을 새로 만든다.
 *
 * 인자를 받지 않는다. `CircleLike`를 새 plain object로 복사하려면 `circleFrom`을 사용한다.
 */
export function createCircle(): CircleWritable {
  return { center: { x: 0, y: 0 }, radius: 0 };
}
