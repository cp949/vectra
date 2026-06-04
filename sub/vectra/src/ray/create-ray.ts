import type { RayWritable } from '../types';

/**
 * origin과 direction이 (0, 0)으로 초기화된 degenerate ray writable을 새로 만든다.
 *
 * 인자를 받지 않는다. `RayLike`를 새 plain object로 복사하려면 `rayFrom`을 사용한다.
 */
export function createRay(): RayWritable {
  return { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } };
}
