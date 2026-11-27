import type { ArcToCubicOptions } from '../types';
import type { CenterArc, CubicCurveWritable } from '../types/flat-shapes.internal';
import { arcToCubicInto } from './arc-to-cubic-into';

/**
 * center form arc를 cubic Bezier curve 목록으로 근사한 새 삼차 베지어 배열을 반환한다.
 *
 * arc를 maxAngle(기본 π/2) 이하의 segment로 분할하고 각 segment를 cubic Bezier로 근사한다.
 * zero-sweep arc(startAngle === endAngle) 또는 degenerate arc는 빈 배열을 반환한다.
 * options.maxAngle이 finite positive가 아니면 기본값 Math.PI / 2를 사용한다.
 * 성능 최적화가 필요하면 `arcToCubicInto`를 사용한다.
 *
 * @param centerArc center form arc input
 * @param options 분할 옵션. 생략하면 `{ maxAngle: Math.PI / 2 }`를 쓴다.
 * @returns 새로 만든 삼차 베지어 배열
 */
export function arcToCubic(centerArc: CenterArc, options?: Required<ArcToCubicOptions>): CubicCurveWritable[] {
  return arcToCubicInto([], centerArc, options);
}
