import { snapScalar } from '../math/snap.internal';
import type { Point } from '../types/flat-shapes.internal';
import type { SnapResult } from './types';
import { hypot2 } from '../internal/numeric';

/**
 * point를 grid에 snap한 SnapResult를 반환한다.
 *
 * 항상 `snapped: true`를 반환한다. allocating companion.
 *
 * gridSize의 x 또는 y가 양수가 아니면(0, 음수, NaN 등) 해당 축 좌표는 NaN이 되고
 * distance도 NaN이 된다. throw하지 않는다.
 *
 * @param point snap할 입력 좌표
 * @param gridSize 축별 grid 간격 { x, y }
 * @param options grid origin 오프셋 { offsetX, offsetY } (생략 시 0, 0)
 */
export function snapPointToGrid(
  point: Point,
  gridSize: Point,
  options?: { offsetX: number; offsetY: number }
): SnapResult {
  const gx = gridSize.x;
  const gy = gridSize.y;

  const ox = options === undefined ? 0 : options.offsetX;
  const oy = options === undefined ? 0 : options.offsetY;

  const origX = point.x;
  const origY = point.y;

  const snapX = gx > 0 ? snapScalar(origX, gx, ox) : Number.NaN;
  const snapY = gy > 0 ? snapScalar(origY, gy, oy) : Number.NaN;

  const dx = snapX - origX;
  const dy = snapY - origY;

  return {
    snapped: true,
    x: snapX,
    y: snapY,
    distance: hypot2(dx, dy),
    source: 'grid',
  };
}
