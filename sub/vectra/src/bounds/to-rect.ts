import { createRect } from '../rect/create-rect';
import type { Bounds, RectWritable } from '../types/flat-shapes.internal';
import { toRectInto } from './to-rect-into';

/**
 * bounds extent를 새 plain rect로 반환한다.
 *
 * `x=minX`, `y=minY`, `width=maxX-minX`, `height=maxY-minY`를 기록한다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `toRectInto`와 동일하다.
 * @param bounds rect로 변환할 bounds
 */
export function toRect(bounds: Bounds): RectWritable {
  return toRectInto(createRect(), bounds);
}
