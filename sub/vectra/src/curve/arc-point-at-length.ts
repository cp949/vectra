import type { TAtLengthOptions } from '../types';
import type { CenterArc, PointWritable } from '../types/flat-shapes.internal';
import { arcPointAtLengthInto } from './arc-point-at-length-into';

/**
 * arc length distance에 해당하는 arc 위 point를 새 object로 반환한다.
 * `arcPointAtLengthInto`의 allocating companion이다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `arcPointAtLengthInto`와 동일하다.
 * clamp/정규화/fallback 정책은 `arcPointAtLengthInto`와 동일하다.
 * @param centerArc center form arc input
 * @param distance 목표 arc length
 * @param options TAtLength 탐색 옵션
 */
export function arcPointAtLength(
  centerArc: CenterArc,
  distance: number,
  options?: Required<TAtLengthOptions>
): PointWritable {
  return arcPointAtLengthInto({ x: 0, y: 0 }, centerArc, distance, options);
}
