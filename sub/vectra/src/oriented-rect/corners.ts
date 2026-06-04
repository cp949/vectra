import type { OrientedRectLike } from '../types';
import { cornersInto } from './corners-into';

/**
 * oriented rect의 4개 corner point를 새 plain object array로 반환한다.
 *
 * local `topLeft`, `topRight`, `bottomRight`, `bottomLeft` 순서로 새 `{ x, y }` 4개를 담은 배열을
 * 반환한다. local corner는 center 기준 `(-w/2, -h/2)`, `(w/2, -h/2)`, `(w/2, h/2)`, `(-w/2, h/2)`이며
 * angle로 회전 후 center로 평행이동한다. `size.x <= 0 || size.y <= 0`인 empty oriented rect에서도
 * raw 좌표로 4개 point를 반환하며 corner가 겹치거나 order가 뒤집힐 수 있다. size 두 성분이나
 * angle이 non-finite이면 `RangeError`다. center 좌표 non-finite는 검증하지 않고 산술 결과를 따른다.
 *
 * @param rect corner를 읽을 oriented rect
 */
export function corners(rect: OrientedRectLike): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  cornersInto(out, rect);
  return out;
}
