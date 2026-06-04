import { DEFAULT_EPSILON } from '../internal/numeric';
import { closestLineFamilyPolygonIntersectionInto } from '../internal/polygon-line-intersections';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { LinePolygonIntersectionHit, PolygonLike, RayLike, XYObjectWritable, XYWritable } from '../types';

/**
 * ray와 polygon edge의 가장 가까운 교점을 out에 기록하고 true를 반환한다.
 *
 * `rayPolygonIntersections` collection의 첫 hit(ray parameter `tLine` 최소)을 source of truth로
 * 사용한다. 별도 교점 계산으로 drift를 만들지 않는다.
 * out에는 `point`=교점, `kind`=edge-level 교차 종류(`cross`/`touch`/`overlap`),
 * `tLine`=ray parameter `[0, ∞)`, `tEdge`=edge-local parameter `[0, 1]`, `edgeIndex`=polygon edge
 * index를 기록한다. overlap이 첫 hit이면 overlap 구간 시작점(`kind: 'overlap'`)을 기록한다.
 *
 * - ray는 `tLine >= 0` 구간만 본다. origin이 polygon 내부면 boundary exit hit을 기록한다.
 * - 교점이 없으면 `false`를 반환하고 out을 수정하지 않는다.
 * - empty polygon(`points.length < 3`)과 degenerate ray direction(zero-length)도 `false`다.
 *
 * out.point는 매 호출 새로 기록하므로 좌표를 받을 writable storage여야 한다.
 * `epsilon`은 collinear/vertex dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param out 교점을 기록할 writable hit (no-hit이면 미수정)
 * @param ray 교점을 구할 ray
 * @param polygon 교점을 구할 polygon
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function closestRayPolygonIntersectionInto<P extends XYWritable = XYObjectWritable>(
  out: LinePolygonIntersectionHit<P>,
  ray: RayLike,
  polygon: PolygonLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const origin = readRayOrigin(ray);
  const direction = readRayDirection(ray);
  return closestLineFamilyPolygonIntersectionInto(
    out,
    readX(origin),
    readY(origin),
    readX(direction),
    readY(direction),
    'ray',
    polygon,
    epsilon
  );
}
