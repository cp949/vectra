import type { CenterArcLike, FlattenOptions, XYObjectWritable } from '../types';
import { arcFlattenInto } from './arc-flatten-into';

/**
 * center form arc를 adaptive subdivision으로 polyline에 근사한 새 XYObjectWritable[] 배열을 반환한다.
 *
 * degenerate(rx<=0 또는 ry<=0)이면 center 좌표를 시작점과 끝점에 둔 polyline을 반환한다.
 * zero-sweep(startAngle === endAngle)이면 시작 각도의 ellipse 점을 두 번 push한 polyline을 반환한다.
 * 성능 최적화가 필요하면 `arcFlattenInto`를 사용한다.
 *
 * @param centerArc center form arc input
 * @param options flatten 옵션 (flatness 기본값 0.5, maxRecursion 기본값 32)
 * @returns 새로 만든 XYObjectWritable point 배열
 */
export function arcFlatten(centerArc: CenterArcLike, options?: FlattenOptions): XYObjectWritable[] {
  return arcFlattenInto([], centerArc, options);
}
