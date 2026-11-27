import type { PolylineWritable } from '../types/flat-shapes.internal';

export interface CreatePointListOptions {
  readonly clonePoints: boolean;
}

/**
 * 빈 writable 점 배열을 반환한다.
 *
 * 기존 점 배열을 복사하려면 `polylineFrom`을 사용한다.
 */
export function createPolyline(): PolylineWritable {
  return [];
}
