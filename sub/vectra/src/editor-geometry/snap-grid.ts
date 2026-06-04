import { readX, readY } from '../internal/xy';
import { snapScalar } from '../math/snap.internal';
import type { XYInput } from '../types';
import type { SnapResult } from './types';

/**
 * point를 grid에 snap한 SnapResult를 반환한다.
 *
 * 항상 `snapped: true`를 반환한다. allocating companion.
 *
 * gridSize의 x 또는 y가 양의 유한수가 아니면(0, 음수, NaN 등) 해당 축 좌표는 NaN이 되고
 * distance도 NaN이 된다. throw하지 않는다.
 *
 * @param point snap할 입력 좌표
 * @param gridSize grid 간격. number이면 x/y 동일, 객체이면 x/y 독립
 * @param options.offset grid origin 오프셋 (기본값 0,0)
 */
export function snapPointToGrid(
  point: XYInput,
  gridSize: number | { x: number; y: number },
  options?: { offset?: XYInput }
): SnapResult {
  const gx = typeof gridSize === 'number' ? gridSize : gridSize.x;
  const gy = typeof gridSize === 'number' ? gridSize : gridSize.y;

  const ox = options?.offset != null ? readX(options.offset) : 0;
  const oy = options?.offset != null ? readY(options.offset) : 0;

  const origX = readX(point);
  const origY = readY(point);

  const snapX = gx > 0 ? snapScalar(origX, gx, ox) : Number.NaN;
  const snapY = gy > 0 ? snapScalar(origY, gy, oy) : Number.NaN;

  const dx = snapX - origX;
  const dy = snapY - origY;

  return {
    snapped: true,
    x: snapX,
    y: snapY,
    distance: Math.hypot(dx, dy),
    source: 'grid',
  };
}
