import { DEFAULT_EPSILON } from '../internal/numeric';
import { computeVisibilityRayHits, DEFAULT_VISIBILITY_ANGLE_OFFSET } from '../internal/polygon-visibility';
import { readX, readY } from '../internal/xy';
import type { PolygonLike, VisibilityOptions, XYInput, XYObjectWritable } from '../types';

/**
 * point에서 본 visibility polygon point list를 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * `raysFromPointToPolygonInto`와 같은 ray casting 계산을 source로 쓰고 hit point만 angle 순서로
 * 기록한다. point 순서는 `raysFromPointToPolygonInto`의 angle 순서와 같다.
 *
 * - origin이 polygon 내부면 boundary point들을 angle 순서로 반환한다.
 * - origin이 boundary 위면 zero-distance hit은 제외한다.
 * - 같은 angle과 같은 point는 dedupe된다.
 * - empty obstacle list나 vertex 없는 입력은 빈 배열이다.
 *
 * outPoints는 먼저 clear되고 hit point가 새 `{ x, y }` object로 push된다. push되는 point는 매 호출 새
 * object이며 입력 point object를 재사용하지 않는다. `polygons` input은 readonly로 읽고 mutate하지
 * 않는다. renderer mask나 scene graph는 해석하지 않는다.
 * `options.epsilon`은 line/edge intersection과 dedupe에만 쓰고 finite validation에는 쓰지 않는다.
 * `options.angleOffset` 기본값은 작은 양수(`1e-4`)다.
 *
 * @param outPoints visibility polygon point를 기록할 output array (호출 전 내용은 비워진다)
 * @param point ray origin
 * @param polygons obstacle polygon list
 * @param options epsilon / angleOffset 옵션. 미지정 시 기본값 사용
 */
export function visibilityPolygonInto(
  outPoints: XYObjectWritable[],
  point: XYInput,
  polygons: readonly PolygonLike[],
  options?: VisibilityOptions
): XYObjectWritable[] {
  const epsilon = options?.epsilon ?? DEFAULT_EPSILON;
  const angleOffset = options?.angleOffset ?? DEFAULT_VISIBILITY_ANGLE_OFFSET;
  const records = computeVisibilityRayHits(readX(point), readY(point), polygons, epsilon, angleOffset);

  outPoints.length = 0;
  for (let i = 0; i < records.length; i++) {
    outPoints.push({ x: records[i].x, y: records[i].y });
  }
  return outPoints;
}
