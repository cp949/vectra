import type { PolygonLike, VisibilityOptions, VisibilityRayHit, XYInput } from '../types';
import { raysFromPointToPolygonInto } from './rays-from-point-to-polygon-into';

/**
 * point에서 polygon obstacle list로 쏜 visibility ray hit을 새 배열로 반환한다.
 *
 * `raysFromPointToPolygonInto`의 allocating companion이다. 각 hit은 `VisibilityRayHit`이며
 * `point`=hit point, `angle`=origin→point 방향각(radian), `distance`=Euclidean distance,
 * `polygonIndex`=obstacle list index, `edgeIndex`=polygon edge index다.
 *
 * - 결과는 angle 오름차순이며 같은 angle과 같은 point는 dedupe된다.
 * - origin이 polygon 내부면 boundary hit들을 반환한다.
 * - origin이 boundary 위면 zero-distance hit(`distance <= epsilon`)은 제외한다.
 * - empty obstacle list나 vertex 없는 입력은 빈 배열이다.
 *
 * 반환 hit과 nested point는 매 호출 새 object이며 입력 point object를 재사용하지 않는다.
 * `polygons` input은 readonly로 읽고 mutate하지 않는다. renderer mask나 scene graph는 해석하지 않는다.
 * `options.epsilon`은 line/edge intersection과 dedupe에만 쓰고 finite validation에는 쓰지 않는다.
 * `options.angleOffset` 기본값은 작은 양수(`1e-4`)다.
 *
 * @param point ray origin
 * @param polygons obstacle polygon list
 * @param options epsilon / angleOffset 옵션. 미지정 시 기본값 사용
 */
export function raysFromPointToPolygon(
  point: XYInput,
  polygons: readonly PolygonLike[],
  options?: VisibilityOptions
): VisibilityRayHit[] {
  const out: VisibilityRayHit[] = [];
  raysFromPointToPolygonInto(out, point, polygons, options);
  return out;
}
