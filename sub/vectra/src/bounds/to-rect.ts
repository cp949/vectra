import { createRect } from '../rect/create-rect';
import type { BoundsLike, RectWritable } from '../types';
import { toRectInto } from './to-rect-into';

/**
 * bounds extent를 새 plain rect로 반환한다.
 *
 * `x=min.x`, `y=min.y`, `width=max.x-min.x`, `height=max.y-min.y`를 기록한다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `toRectInto`와 동일하다.
 * @param bounds rect로 변환할 bounds
 */
export function toRect(bounds: BoundsLike): RectWritable {
  return toRectInto(createRect(), bounds);
}
