import type { OrientedRectWritable, RectLike } from '../types';
import { fromRectInto } from './from-rect-into';

/**
 * axis-aligned rect와 angle로부터 oriented rect를 새 plain object로 반환한다.
 *
 * `center = (x + width/2, y + height/2)`, `size = (width, height)`, `angle`을 담은
 * `{ center, size, angle }`를 반환한다. negative width/height는 size에 그대로 보존하며 empty 판정과
 * 처리는 query helper 책임이다. `width`, `height`, `angle`이 non-finite이면 `RangeError`다. `x`, `y`는
 * finite validation 없이 산술 결과를 따른다.
 *
 * @param rect 변환할 axis-aligned rect
 * @param angle local x축 회전각. 단위는 radian.
 */
export function fromRect(rect: RectLike, angle: number): OrientedRectWritable {
  return fromRectInto({ center: { x: 0, y: 0 }, size: { x: 0, y: 0 }, angle: 0 }, rect, angle);
}
