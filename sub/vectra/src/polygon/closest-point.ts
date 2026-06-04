import type { PolygonLike, XYInput, XYObjectWritable } from '../types';
import { closestPointInto } from './closest-point-into';

/**
 * closestPointInto의 allocating companion. 실패 시 undefined를 반환한다.
 *
 * degenerate/empty 입력 처리 정책은 `closestPointInto`와 동일하다.
 */
export function closestPoint(polygon: PolygonLike, point: XYInput): XYObjectWritable | undefined {
  const seed: XYObjectWritable = { x: 0, y: 0 };
  if (!closestPointInto(seed, polygon, point)) return undefined;
  return seed;
}
