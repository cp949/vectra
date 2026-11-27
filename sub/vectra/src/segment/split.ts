import { createZeroSegment } from '../internal/segment';
import type { SegmentSplit } from '../types';
import type { Segment } from '../types/flat-shapes.internal';
import { splitInto } from './split-into';

/**
 * segment를 normalized `t` 기준으로 left/right 두 segment로 분할해 새 plain object로 반환한다.
 *
 * 대응 `splitInto`와 정책이 같다. `t`는 `[0, 1]`로 clamp한다. `t <= 0`이면 `left`는 zero-length
 * `a -> a`, `right`는 원본 `a -> b`다. `t >= 1`이면 `left`는 원본 `a -> b`, `right`는 zero-length
 * `b -> b`다. zero-length segment도 실패가 아니라 두 zero-length segment를 반환한다. `t`가
 * non-finite이면 `RangeError`로 fail-fast한다. segment endpoint 좌표가 non-finite(NaN/±Infinity)이면
 * arithmetic 결과도 그대로 반환된다.
 *
 * @param line 분할할 segment
 * @param t normalized 분할 위치. `[0, 1]`로 clamp한다. non-finite면 `RangeError`
 */
export function split(line: Segment, t: number): SegmentSplit {
  return splitInto({ left: createZeroSegment(), right: createZeroSegment() }, line, t);
}
