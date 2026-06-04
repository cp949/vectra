import type { RayWritable, SegmentLike } from '../types';
import { fromSegmentInto } from './from-segment-into';

/**
 * segment `a -> b`를 `origin = a`, `direction = b - a`로 변환한 새 plain object를 반환한다.
 *
 * `fromSegmentInto`에 위임하는 companion wrapper다.
 *
 * degenerate/empty 입력 처리 정책은 `fromSegmentInto`와 동일하다.
 */
export function fromSegment(line: SegmentLike): RayWritable {
  return fromSegmentInto({ origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } }, line);
}
