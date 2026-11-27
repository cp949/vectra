import type { RayWritable } from '../types/flat-shapes.internal';

/**
 * origin과 direction이 (0, 0)으로 초기화된 degenerate ray writable을 새로 만든다.
 *
 * 인자를 받지 않는다. `Ray`를 새 plain object로 복사하려면 `rayFrom`을 사용한다.
 */
export function createRay(): RayWritable {
  return { ox: 0, oy: 0, dx: 0, dy: 0 };
}
