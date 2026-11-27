import type { Polyline, PolylineWritable } from '../types/flat-shapes.internal';
import type { CreatePointListOptions } from './create-polyline';

/**
 * polyline의 점을 새 배열과 새 `{ x, y }` 객체에 복사한다.
 *
 * `{ clonePoints: false }`를 넘기면 입력 배열 자체를 반환한다.
 * 이때 반환값을 수정하려면 입력 배열과 점이 쓰기 가능해야 한다.
 *
 * @param polyline 복사할 점 배열
 * @param options 점 복사 옵션. 생략하면 `{ clonePoints: true }`를 쓴다.
 */
export function polylineFrom(polyline: Polyline, options?: CreatePointListOptions): PolylineWritable {
  if (options !== undefined && options.clonePoints === false) return polyline as PolylineWritable;
  return polyline.map(({ x, y }) => ({ x, y }));
}
