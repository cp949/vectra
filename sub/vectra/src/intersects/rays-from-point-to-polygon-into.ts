import { DEFAULT_EPSILON } from '../internal/numeric';
import { computeVisibilityRayHits, DEFAULT_VISIBILITY_ANGLE_OFFSET } from '../internal/polygon-visibility';
import type { VisibilityOptions, VisibilityRayHit } from '../types';
import type { Point, Polygon } from '../types/flat-shapes.internal';

/**
 * point에서 polygon obstacle list로 쏜 visibility ray hit을 outHits에 기록하고 같은 outHits를 반환한다.
 *
 * 각 obstacle vertex angle마다 `angle - angleOffset`, `angle`, `angle + angleOffset` ray를 쏘고,
 * obstacle 전체에서 가장 가까운 hit만 채택한다. 각 hit은 `VisibilityRayHit`이며 `point`=hit point,
 * `angle`=origin→point 방향각(radian), `distance`=Euclidean distance, `polygonIndex`=obstacle list
 * index, `edgeIndex`=polygon edge index다.
 *
 * - 결과는 angle 오름차순이며 같은 angle과 같은 point는 dedupe된다.
 * - origin이 polygon 내부면 boundary hit들을 반환한다.
 * - origin이 boundary 위면 zero-distance hit(`distance <= epsilon`)은 제외한다.
 * - empty obstacle list나 vertex 없는 입력은 빈 배열이다.
 *
 * outHits는 먼저 clear되고 결과 hit이 push된다. push되는 hit과 nested point는 매 호출 새 object이며
 * 입력 point object를 재사용하지 않는다. `polygons` input은 readonly로 읽고 mutate하지 않는다.
 * renderer mask나 scene graph는 해석하지 않고 순수 geometry hit만 반환한다.
 * `options.epsilon`은 line/edge intersection과 dedupe에만 쓰고 finite validation에는 쓰지 않는다.
 * 옵션을 생략하면 `epsilon`은 `DEFAULT_EPSILON`, `angleOffset`은 `1e-4`다.
 *
 * @param outHits 가시성 hit을 기록할 배열. 기존 내용은 비우고 { point, angle, distance, polygonIndex, edgeIndex }를 넣는다. point는 { x, y }다.
 * @param point ray origin
 * @param polygons obstacle polygon list
 * @param options epsilon과 angleOffset을 지정하는 옵션.
 */
export function raysFromPointToPolygonInto<Out extends VisibilityRayHit[]>(
  outHits: Out,
  point: Point,
  polygons: readonly Polygon[],
  options?: VisibilityOptions
): Out {
  const epsilon = options === undefined ? DEFAULT_EPSILON : options.epsilon;
  const angleOffset = options === undefined ? DEFAULT_VISIBILITY_ANGLE_OFFSET : options.angleOffset;
  const records = computeVisibilityRayHits(point.x, point.y, polygons, epsilon, angleOffset);

  outHits.length = 0;
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    outHits.push({
      point: { x: r.x, y: r.y },
      angle: r.angle,
      distance: r.distance,
      polygonIndex: r.polygonIndex,
      edgeIndex: r.edgeIndex,
    });
  }
  return outHits;
}
