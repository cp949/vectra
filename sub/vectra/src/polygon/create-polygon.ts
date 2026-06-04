import type { PolygonWritable } from '../types';

export interface CreatePointListOptions {
  readonly clonePoints?: boolean;
}

/**
 * 빈 point list를 가진 polygon writable을 새로 만든다.
 *
 * 인자를 받지 않는다. `PolygonLike` 또는 point 배열을 새 plain object로 복사하려면
 * `polygonFrom`을 사용한다.
 */
export function createPolygon(): PolygonWritable {
  return { points: [] };
}
