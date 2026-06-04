import type { TriangleLike, XYObjectWritable } from '../types';
import { centroidInto } from './centroid-into';

/**
 * centroidInto의 allocating companion.
 * triangle의 centroid를 XYObjectWritable로 반환한다.
 *
 * finite/non-finite 입력과 결과 처리 정책은 `centroidInto`와 동일하다.
 * degenerate/empty 입력 처리 정책은 `centroidInto`와 동일하다.
 * clamp/정규화/fallback 정책은 `centroidInto`와 동일하다.
 * tolerance/iteration option 정책은 `centroidInto`와 동일하다.
 */
export function centroid(triangle: TriangleLike): XYObjectWritable {
  const seed: XYObjectWritable = { x: 0, y: 0 };
  return centroidInto(seed, triangle);
}
