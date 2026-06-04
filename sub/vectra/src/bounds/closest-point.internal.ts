import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, XYInput } from '../types';

/**
 * point를 closed AABB에 clamp한 x/y 좌표를 반환한다.
 *
 * empty bounds 검사 없이 raw clamp 산식을 적용한다. 호출 전 isEmpty 확인은 caller 책임이다.
 * aliasing 안전 — 읽기 후 반환하므로 caller의 out aliasing에 영향을 주지 않는다.
 *
 * @param bounds clamp 기준 AABB
 * @param point clamp할 입력 좌표
 */
export function clampPointXY(bounds: BoundsLike, point: XYInput): [cx: number, cy: number] {
  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const minX = readX(min);
  const minY = readY(min);
  const maxX = readX(max);
  const maxY = readY(max);
  const px = readX(point);
  const py = readY(point);
  return [Math.min(Math.max(px, minX), maxX), Math.min(Math.max(py, minY), maxY)];
}
