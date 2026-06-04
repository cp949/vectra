import { readPolygonPoints } from '../internal/polygon';
import type { PolygonLike } from '../types';

/**
 * polygon이 structural empty인지 반환한다.
 *
 * pointCount < 3이면 true다. zero-area collinear polygon은 structural empty가 아니다.
 *
 * @param polygon empty 여부를 확인할 polygon
 */
export function isEmpty(polygon: PolygonLike): boolean {
  return readPolygonPoints(polygon).length < 3;
}
