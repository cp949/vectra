import type { TriangleWritable } from '../types';

/**
 * 세 vertex가 원점으로 초기화된 zero triangle writable을 새로 만든다.
 *
 * 인자를 받지 않는다. `TriangleLike`를 새 plain object로 복사하려면 `triangleFrom`을 사용한다.
 */
export function createTriangle(): TriangleWritable {
  return {
    a: { x: 0, y: 0 },
    b: { x: 0, y: 0 },
    c: { x: 0, y: 0 },
  };
}
