import type { Bounds } from '../types/flat-shapes.internal';

/**
 * bounds의 raw height를 반환한다.
 *
 * empty/inverted bounds에서도 maxY - minY를 그대로 반환하므로 음수가 될 수 있다.
 *
 * @param bounds height를 계산할 bounds
 */
export function height(bounds: Bounds): number {
  return bounds.maxY - bounds.minY;
}
