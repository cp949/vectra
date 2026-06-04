import type { PointAtLengthOptions, SegmentLike, XYObjectWritable } from '../types';
import { pointAtLengthInto } from './point-at-length-into';

/**
 * segment 위 `distance` 길이 위치를 새 object로 반환한다.
 *
 * - 기본 동작: clamp. `distance <= 0`이면 시작점, `distance >= length(line)`이면 끝점을 반환한다.
 * - `options?.clamp === false`이면 extrapolation: `distance / length` 비율을 그대로 사용해
 *   supporting line 위 점을 반환한다.
 * - zero-length segment는 `distance`와 clamp 여부에 무관하게 시작점을 반환한다.
 * - `distance`가 `NaN`이면 clamp 비교가 모두 false이므로 default clamp 경로에서 extrapolation과
 *   동일한 NaN 좌표가 반환된다. non-finite 입력은 별도 validation 없이 JavaScript number 연산
 *   결과를 따른다.
 *
 * @param line 대상 segment
 * @param distance segment 시작점에서의 arc-length 거리
 * @param options clamp 정책 옵션
 */
export function pointAtLength(line: SegmentLike, distance: number, options?: PointAtLengthOptions): XYObjectWritable {
  return pointAtLengthInto({ x: 0, y: 0 }, line, distance, options);
}
