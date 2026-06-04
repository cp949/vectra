import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY, writeXY } from '../internal/xy';
import type { RectLike, XYInput, XYWritable } from '../types';

/**
 * point를 rect의 closed boundary 안으로 clamp해 `out`에 기록하고 반환한다.
 *
 * non-empty rect(`width > 0 && height > 0`)에서 `x`는 `[rect.x, rect.x + rect.width]`,
 * `y`는 `[rect.y, rect.y + rect.height]`로 clamp한다. boundary는 closed interval이므로
 * edge 위 point는 그대로 유지한다.
 *
 * empty rect(`width <= 0 || height <= 0`)는 clamp 가능한 area가 없으므로 raw top-left
 * `(rect.x, rect.y)`를 기록한다. negative dimension rect도 empty로 보며 corner
 * normalization을 적용하지 않는다.
 *
 * non-empty rect에서 `NaN` point component는 `NaN`으로 전파한다. `Infinity`/`-Infinity`는
 * `Math.min`/`Math.max` 결과로 각각 max/min boundary에 붙는다. rect component가 non-finite여도
 * 별도 validation 없이 `Math.min`/`Math.max` 결과를 따른다.
 * `out`과 `point`가 같은 object여도 안전하다. point 좌표를 먼저 읽은 뒤 기록한다.
 *
 * @param out clamp된 좌표를 기록할 writable output
 * @param rect clamp 경계가 될 rect
 * @param point rect 안으로 clamp할 point
 */
export function clampPointInto<Out extends XYWritable>(out: Out, rect: RectLike, point: XYInput): Out {
  const px = readX(point);
  const py = readY(point);
  const x = readRectX(rect);
  const y = readRectY(rect);
  const w = readRectWidth(rect);
  const h = readRectHeight(rect);

  if (w <= 0 || h <= 0) {
    return writeXY(out, x, y);
  }

  const cx = Math.min(Math.max(px, x), x + w);
  const cy = Math.min(Math.max(py, y), y + h);
  return writeXY(out, cx, cy);
}
