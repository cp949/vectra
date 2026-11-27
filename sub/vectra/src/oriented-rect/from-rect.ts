import type { OrientedRectWritable, Rect } from '../types/flat-shapes.internal';
import { fromRectInto } from './from-rect-into';

/**
 * axis-aligned rect와 angle로부터 oriented rect를 새 plain object로 반환한다.
 *
 * `cx = x + width/2`, `cy = y + height/2`, `width`, `height`, `angle`을 담은
 * `{ cx, cy, width, height, angle }`를 반환한다. 음수 width/height도 그대로 보존하며 empty 판정과
 * 처리는 query helper 책임이다. `width`, `height`, `angle`이 non-finite이면 `RangeError`다. `x`, `y`는
 * finite validation 없이 산술 결과를 따른다.
 *
 * @param rect 변환할 axis-aligned rect
 * @param angle local x축 회전각. 단위는 radian.
 */
export function fromRect(rect: Rect, angle: number): OrientedRectWritable {
  return fromRectInto({ cx: 0, cy: 0, width: 0, height: 0, angle: 0 }, rect, angle);
}
