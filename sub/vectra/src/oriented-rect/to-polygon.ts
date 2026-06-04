import { readOrientedRectQueryFrame, writeOrientedRectCorners } from '../internal/oriented-rect-query';
import type { OrientedRectLike, PolygonWritable } from '../types';

/**
 * oriented rect의 4개 corner를 polygon vertex로 담은 새 `{ points }` object를 반환한다.
 *
 * vertex 순서는 local `topLeft` → `topRight` → `bottomRight` → `bottomLeft`로 `corners`와 같다.
 * local corner는 center 기준 `(-w/2, -h/2)`, `(w/2, -h/2)`, `(w/2, h/2)`, `(-w/2, h/2)`이며 angle로
 * 회전 후 center로 평행이동한다.
 *
 * `size.x <= 0 || size.y <= 0`인 empty oriented rect에서도 raw 좌표로 vertex 4개를 반환한다.
 * zero/negative size에서는 vertex가 겹치거나 winding이 뒤집힐 수 있다. size 두 성분이나 angle이
 * non-finite이면 `RangeError`다. center 좌표 non-finite는 검증하지 않고 산술 결과를 따른다.
 * 매 호출마다 새 `{ points }` object와 새 point object 4개를 생성한다.
 *
 * @param rect polygon으로 변환할 oriented rect
 */
export function toPolygon(rect: OrientedRectLike): PolygonWritable {
  const frame = readOrientedRectQueryFrame(rect);
  const result: PolygonWritable = { points: [] };
  writeOrientedRectCorners(result.points, frame);
  return result;
}
