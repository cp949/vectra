import { DEFAULT_EPSILON } from '../internal/numeric';
import { computeVisibilityRayHits, DEFAULT_VISIBILITY_ANGLE_OFFSET } from '../internal/polygon-visibility';
import type { VisibilityOptions } from '../types';
import type { Point, Polygon, PolygonWritable } from '../types/flat-shapes.internal';

/**
 * point에서 본 visibility polygon의 x·y 좌표 목록를 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * `raysFromPointToPolygonInto`와 같은 ray casting 계산을 source로 쓰고 hit point만 angle 순서로
 * 기록한다. point 순서는 `raysFromPointToPolygonInto`의 angle 순서와 같다.
 *
 * - origin이 polygon 내부면 boundary point들을 angle 순서로 반환한다.
 * - origin이 boundary 위면 zero-distance hit은 제외한다.
 * - 같은 angle과 같은 point는 dedupe된다.
 * - empty obstacle list나 vertex 없는 입력은 빈 배열이다.
 *
 * outPoints는 먼저 비우고 교점의 x·y를 차례로 기록한다.
 * `polygons`는 읽기 전용이다.
 * `options.epsilon`은 line/edge intersection과 dedupe에만 쓰고 finite validation에는 쓰지 않는다.
 * 옵션을 생략하면 `epsilon`은 `DEFAULT_EPSILON`, `angleOffset`은 `1e-4`다.
 *
 * @param outPoints 기존 내용을 비우고 교점의 x·y를 기록할 좌표 배열.
 * @param point ray origin
 * @param polygons obstacle polygon list
 * @param options epsilon과 angleOffset을 지정하는 옵션.
 */
export function visibilityPolygonInto<Out extends PolygonWritable>(
  outPoints: Out,
  point: Point,
  polygons: readonly Polygon[],
  options?: VisibilityOptions
): Out {
  const epsilon = options === undefined ? DEFAULT_EPSILON : options.epsilon;
  const angleOffset = options === undefined ? DEFAULT_VISIBILITY_ANGLE_OFFSET : options.angleOffset;
  const records = computeVisibilityRayHits(point.x, point.y, polygons, epsilon, angleOffset);

  outPoints.length = 0;
  for (let i = 0; i < records.length; i++) {
    outPoints.push(records[i].x, records[i].y);
  }
  return outPoints;
}
