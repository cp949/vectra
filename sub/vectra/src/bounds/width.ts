import type { Bounds } from '../types/flat-shapes.internal';

/**
 * bounds의 raw width를 반환한다.
 *
 * empty/inverted bounds에서도 maxX - minX를 그대로 반환하므로 음수가 될 수 있다.
 *
 * @param bounds width를 계산할 bounds
 */
export function width(bounds: Bounds): number {
  return bounds.maxX - bounds.minX;
}
