import type { Polygon, PointWritable } from '../types/flat-shapes.internal';
import { toPolylineInto } from './to-polyline-into';

/**
 * polygon vertex를 순서대로 복사한 open polyline view를 새 배열로 반환한다.
 *
 * point-collection 기준이다. 0개 point면 빈 배열을 반환하고, 좌표 finite 여부를 검사하지 않는다.
 * `options.close === true`이고 point가 1개 이상이면 첫 vertex 복사본을 끝에 추가한다.
 *
 * @param polygon vertex를 읽을 polygon
 * @param options close — true이면 첫 vertex 복사본을 끝에 추가한다. 기본 false(open view)
 */
export function toPolyline(polygon: Polygon, options?: { readonly close: boolean }): PointWritable[] {
  return toPolylineInto([], polygon, options);
}
