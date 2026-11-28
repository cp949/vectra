import type { VisibilityOptions } from '../types';
import type { Point, Polygon, PolygonWritable } from '../types/flat-shapes.internal';
import { visibilityPolygonInto } from './visibility-polygon-into';

/**
 * point에서 본 visibility polygon의 x·y 좌표 목록를 새 배열로 반환한다.
 *
 * `visibilityPolygonInto`의 allocating companion이다. hit point를 angle 순서로 반환하며 순서는
 * `raysFromPointToPolygon`의 angle 순서와 같다.
 *
 * - origin이 polygon 내부면 boundary point들을 angle 순서로 반환한다.
 * - origin이 boundary 위면 zero-distance hit은 제외한다.
 * - 같은 angle과 같은 point는 dedupe된다.
 * - empty obstacle list나 vertex 없는 입력은 빈 배열이다.
 *
 * 반환 배열은 교점의 x·y를 차례로 담는다.
 * `polygons` input은 readonly로 읽고 mutate하지 않는다. renderer mask나 scene graph는 해석하지 않는다.
 * `options.epsilon`은 line/edge intersection과 dedupe에만 쓰고 finite validation에는 쓰지 않는다.
 * 옵션을 생략하면 `epsilon`은 `DEFAULT_EPSILON`, `angleOffset`은 `1e-4`다.
 *
 * @param point ray origin
 * @param polygons obstacle polygon list
 * @param options epsilon과 angleOffset을 지정하는 옵션.
 */
export function visibilityPolygon(
  point: Point,
  polygons: readonly Polygon[],
  options?: VisibilityOptions
): PolygonWritable {
  const out: PolygonWritable = [];
  visibilityPolygonInto(out, point, polygons, options);
  return out;
}
