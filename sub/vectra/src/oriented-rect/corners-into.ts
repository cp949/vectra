import { readOrientedRectQueryFrame, writeOrientedRectCorners } from '../internal/oriented-rect-query';
import type { OrientedRectLike, XYObjectWritable } from '../types';

/**
 * oriented rect의 4개 corner point를 `out` 배열에 push한다.
 *
 * `out.length = 0` 후 local `topLeft`, `topRight`, `bottomRight`, `bottomLeft` 순서로 새 writable
 * object를 push한다. 반환 후 배열 길이는 항상 4이다. local corner는 center 기준
 * `(-w/2, -h/2)`, `(w/2, -h/2)`, `(w/2, h/2)`, `(-w/2, h/2)`이며 angle로 회전 후 center로 평행이동한다.
 *
 * `size.x <= 0 || size.y <= 0`인 empty oriented rect에서도 raw 좌표로 4개 point를 push한다.
 * zero/negative size에서는 corner가 겹치거나 order가 뒤집힐 수 있다. size 두 성분이나 angle이
 * non-finite이면 `RangeError`다. center 좌표 non-finite는 검증하지 않고 산술 결과를 따른다.
 *
 * @param out corner point를 push할 writable array
 * @param rect corner를 읽을 oriented rect
 */
export function cornersInto(out: XYObjectWritable[], rect: OrientedRectLike): void {
  // aliasing 안전 - query frame이 모든 입력 값을 먼저 읽은 후 새 corner를 기록한다
  const frame = readOrientedRectQueryFrame(rect);
  writeOrientedRectCorners(out, frame);
}
