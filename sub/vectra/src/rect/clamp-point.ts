import type { RectLike, XYInput } from '../types';
import { clampPointInto } from './clamp-point-into';

/**
 * point를 rect의 closed boundary 안으로 clamp해 새 `{ x, y }` object로 반환한다.
 *
 * non-empty rect(`width > 0 && height > 0`)에서 `x`는 `[rect.x, rect.x + rect.width]`,
 * `y`는 `[rect.y, rect.y + rect.height]`로 clamp한다. boundary는 closed interval이므로
 * edge 위 point는 그대로 유지한다.
 *
 * empty rect(`width <= 0 || height <= 0`)는 clamp 가능한 area가 없으므로 raw top-left
 * `(rect.x, rect.y)`를 반환한다. negative dimension rect도 empty로 보며 corner
 * normalization을 적용하지 않는다.
 *
 * non-empty rect에서 `NaN` point component는 `NaN`으로 전파한다. `Infinity`/`-Infinity`는
 * `Math.min`/`Math.max` 결과로 각각 max/min boundary에 붙는다. rect component가 non-finite여도
 * 별도 validation 없이 `Math.min`/`Math.max` 결과를 따른다.
 *
 * @param rect clamp 경계가 될 rect
 * @param point rect 안으로 clamp할 point
 */
export function clampPoint(rect: RectLike, point: XYInput): { x: number; y: number } {
  return clampPointInto({ x: 0, y: 0 }, rect, point);
}
