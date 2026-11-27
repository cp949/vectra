import type { TAtLengthOptions } from '../types';
import type { CenterArc, PointWritable } from '../types/flat-shapes.internal';
import { arcPointAtTInto } from './arc-point-at-t-into';
import { arcTAtLength } from './arc-t-at-length';

/**
 * arc length distance에 해당하는 arc 위 point를 out에 기록하고 out을 반환한다.
 *
 * distance를 [0, totalLength]로 clamp해 계산한다.
 * degenerate/zero-sweep arc는 start point를 반환한다.
 *
 * @param out 결과를 기록할 점 객체
 * @param centerArc center form arc input
 * @param distance 목표 arc length
 * @param options TAtLength 탐색 옵션
 * @returns out
 */
export function arcPointAtLengthInto<Out extends PointWritable>(
  out: Out,
  centerArc: CenterArc,
  distance: number,
  options?: Required<TAtLengthOptions>
): Out {
  const t = arcTAtLength(centerArc, distance, options);
  return arcPointAtTInto(out, centerArc, t);
}
