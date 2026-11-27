import type { Bounds } from '../types/flat-shapes.internal';

/**
 * bounds가 inverted empty bounds이면 true를 반환한다.
 *
 * maxX < minX 또는 maxY < minY인 경우만 empty이다. width나 height가 0인 line/point bounds는
 * empty가 아니다.
 *
 * @param bounds empty 여부를 확인할 bounds
 */
export function isEmpty(bounds: Bounds): boolean {
  return bounds.maxX < bounds.minX || bounds.maxY < bounds.minY;
}
