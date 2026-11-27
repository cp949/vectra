import type { RayWritable, Segment } from '../types/flat-shapes.internal';
import { fromSegmentInto } from './from-segment-into';

/**
 * 선분을 `(ox, oy) = (x1, y1)`, `(dx, dy) = (x2 - x1, y2 - y1)`로 변환한 새 plain object를 반환한다.
 *
 * `fromSegmentInto`에 위임하는 companion wrapper다.
 *
 * degenerate/empty 입력 처리 정책은 `fromSegmentInto`와 동일하다.
 */
export function fromSegment(line: Segment): RayWritable {
  return fromSegmentInto({ ox: 0, oy: 0, dx: 0, dy: 0 }, line);
}
