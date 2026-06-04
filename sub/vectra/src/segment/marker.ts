import type { SegmentLike, SegmentMarkerOptions, XYObjectWritable } from '../types';
import { markerInto } from './marker-into';

/**
 * segment endpoint marker geometry point를 새 array로 반환한다.
 *
 * 대응 `markerInto`와 정책이 같다. arrow는 endpoint당 `[leftBarb, tip, rightBarb]` 3점, tick은
 * endpoint 중심 perpendicular 2점을 반환한다. `at: "both"`는 start marker point를 먼저, end marker
 * point를 이어서 반환한다. zero-length segment나 non-finite 좌표(NaN/±Infinity) segment는 빈
 * array를 반환한다. `length`/`width`가 finite positive가 아니면 `RangeError`로 fail-fast한다.
 *
 * @param line marker를 만들 segment
 * @param options marker type/at/length/width 옵션. 생략 시 end arrow, length 10, width 8
 */
export function marker(line: SegmentLike, options?: SegmentMarkerOptions): XYObjectWritable[] {
  return markerInto([], line, options);
}
