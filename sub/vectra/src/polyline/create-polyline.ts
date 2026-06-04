import type { PolylineWritable } from '../types';

export interface CreatePointListOptions {
  readonly clonePoints?: boolean;
}

/**
 * 빈 point list를 가진 polyline writable을 새로 만든다.
 *
 * 인자를 받지 않는다. `PolylineLike` 또는 point 배열을 새 plain object로 복사하려면
 * `polylineFrom`을 사용한다.
 */
export function createPolyline(): PolylineWritable {
  return { points: [] };
}
