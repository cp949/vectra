import type { CardinalPolylineOptions } from '../types';
import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { cardinalPolylineInto } from './cardinal-polyline-into';

/**
 * Cardinal spline 곡선을 steps개 점으로 샘플링한 새 점 배열을 반환한다.
 *
 * t = 0, 1/steps, 2/steps, ..., (steps-1)/steps 위치를 샘플링한다. t=1은 포함하지 않는다.
 * points.length < 2이면 빈 배열 반환. steps <= 0이면 빈 배열 반환.
 * 성능 최적화가 필요하면 `cardinalPolylineInto`를 사용한다.
 *
 * @param points control point 배열
 * @param options 샘플링 옵션. 생략하면 32점을 기록한다.
 * @returns 새로 만든 점 배열
 */
export function cardinalPolyline(
  points: readonly Point[],
  options?: Required<CardinalPolylineOptions>
): PointWritable[] {
  return cardinalPolylineInto([], points, options);
}
