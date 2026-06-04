import { DEFAULT_EPSILON } from '../internal/numeric';
import type { LinePolygonOverlapIntervalDetail, PolygonLike, RayLike } from '../types';
import { rayPolygonOverlapIntervalsInto } from './ray-polygon-overlap-intervals-into';

/**
 * ray와 polygon edge의 collinear overlap 구간을 새 배열로 반환한다.
 *
 * `rayPolygonOverlapIntervalsInto`의 allocating companion이다. 각 interval은
 * `LinePolygonOverlapIntervalDetail`이며 `start`/`end`=구간 끝점, `tLineStart`/`tLineEnd`=ray parameter
 * `[0, ∞)`로 clipping된 구간(`tLineStart <= tLineEnd`), `tEdgeStart`/`tEdgeEnd`=각 끝점의 edge-local
 * parameter `[0, 1]`, `edgeIndex`=polygon edge index다.
 *
 * - ray는 `tLine >= 0` 구간만 포함한다. ray 뒤쪽 overlap은 제외하고 일부만 겹치면 origin부터 clipping한다.
 * - ray가 polygon edge와 collinear로 겹칠 때만 interval을 만든다.
 * - transversal crossing, vertex touch, containment-only는 빈 배열이다.
 * - 한 점으로 수렴하는 overlap은 빈 배열이다.
 * - empty polygon(`points.length < 3`)과 degenerate ray direction(zero-length)은 빈 배열이다.
 *
 * 결과 interval은 `tLineStart` 오름차순이다. 반환 interval과 nested `start`/`end` point는 매 호출 새
 * object이며 입력 point object를 재사용하지 않는다.
 * `epsilon`은 collinear/수렴 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param ray 교차를 구할 ray
 * @param polygon 교차를 구할 polygon
 * @param epsilon collinear/수렴 판정 임계값
 */
export function rayPolygonOverlapIntervals(
  ray: RayLike,
  polygon: PolygonLike,
  epsilon = DEFAULT_EPSILON
): LinePolygonOverlapIntervalDetail[] {
  const out: LinePolygonOverlapIntervalDetail[] = [];
  rayPolygonOverlapIntervalsInto(out, ray, polygon, epsilon);
  return out;
}
