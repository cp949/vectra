import type { Polygon, PolygonWritable } from '../types/flat-shapes.internal';

/**
 * polygon 좌표 배열을 복사한다.
 *
 * 기본값은 새 배열을 만든다. `clonePoints: false`면 원본 배열 참조를 유지한다.
 * 원본과 공유하는 결과에 좌표를 쓰려면 원본이 writable이어야 한다.
 *
 * @param polygon 복사할 polygon 좌표 배열
 * @param options 배열 복사 여부. 생략하면 복사한다
 */
export function polygonFrom(polygon: Polygon, options?: { readonly clonePoints: boolean }): PolygonWritable {
  return options?.clonePoints === false ? (polygon as PolygonWritable) : polygon.slice();
}
