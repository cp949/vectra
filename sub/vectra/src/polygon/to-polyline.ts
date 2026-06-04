import type { PolygonLike, XYObjectWritable } from '../types';
import { toPolylineInto } from './to-polyline-into';

/**
 * polygon vertex를 순서대로 복사한 open polyline view를 새 배열로 반환한다.
 *
 * point-collection 기준이다. 0개 point면 빈 배열을 반환하고, 좌표 finite 여부를 검사하지 않는다.
 * `options.close === true`이고 point가 1개 이상이면 첫 vertex 복사본을 끝에 추가한다.
 * 대응 `toPolylineInto`는 input point array와 outPoints가 같은 배열이어도 안전하다.
 *
 * @param polygon vertex를 읽을 polygon
 * @param options close — true이면 첫 vertex 복사본을 끝에 추가한다. 기본 false(open view)
 */
export function toPolyline(polygon: PolygonLike, options?: { close?: boolean }): XYObjectWritable[] {
  return toPolylineInto([], polygon, options);
}
