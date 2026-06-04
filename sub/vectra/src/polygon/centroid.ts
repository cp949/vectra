import type { PolygonLike, XYObjectWritable } from '../types';
import { centroidInto } from './centroid-into';

/**
 * centroidInto의 allocating companion. 실패 시 undefined를 반환한다.
 *
 * degenerate/empty 입력 처리 정책은 `centroidInto`와 동일하다.
 */
export function centroid(polygon: PolygonLike): XYObjectWritable | undefined {
  const seed: XYObjectWritable = { x: 0, y: 0 };
  if (!centroidInto(seed, polygon)) return undefined;
  return seed;
}
