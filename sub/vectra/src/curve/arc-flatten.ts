import type { FlattenOptions } from '../types';
import type { CenterArc, PointWritable } from '../types/flat-shapes.internal';
import { arcFlattenInto } from './arc-flatten-into';

/**
 * center form arc를 adaptive subdivision으로 polyline에 근사한 새 점 배열을 반환한다.
 *
 * degenerate(rx<=0 또는 ry<=0)이면 center 좌표를 시작점과 끝점에 둔 polyline을 반환한다.
 * zero-sweep(startAngle === endAngle)이면 시작 각도의 ellipse 점을 두 번 push한 polyline을 반환한다.
 * 성능 최적화가 필요하면 `arcFlattenInto`를 사용한다.
 *
 * @param centerArc center form arc input
 * @param options flatten 옵션. 생략하면 `{ flatness: 0.5, maxRecursion: 32 }`을 쓴다.
 * @returns 새로 만든 점 배열
 */
export function arcFlatten(centerArc: CenterArc, options?: Required<FlattenOptions>): PointWritable[] {
  return arcFlattenInto([], centerArc, options);
}
