import { DEFAULT_EPSILON } from '../internal/numeric';
import type { LinePolygonOverlapIntervalDetail, PolygonLike, SegmentLike } from '../types';
import { segmentPolygonOverlapIntervalsInto } from './segment-polygon-overlap-intervals-into';

/**
 * segment와 polygon edge의 collinear overlap 구간을 새 배열로 반환한다.
 *
 * `segmentPolygonOverlapIntervalsInto`의 allocating companion이다. 각 interval은
 * `LinePolygonOverlapIntervalDetail`이며 `start`/`end`=구간 끝점, `tLineStart`/`tLineEnd`=segment
 * parameter `[0, 1]`로 clipping된 구간(`tLineStart <= tLineEnd`), `tEdgeStart`/`tEdgeEnd`=각 끝점의
 * edge-local parameter `[0, 1]`, `edgeIndex`=polygon edge index다.
 *
 * - segment가 polygon edge와 collinear로 겹칠 때만 interval을 만든다.
 * - transversal crossing, vertex touch, polygon 내부 containment-only는 빈 배열이다.
 * - segment range 밖 구간은 clipping되고, 한 점으로 수렴하는 overlap은 빈 배열이다.
 * - empty polygon(`points.length < 3`)과 degenerate segment direction(zero-length)은 빈 배열이다.
 *
 * 결과 interval은 `tLineStart` 오름차순이다. 반환 interval과 nested `start`/`end` point는 매 호출 새
 * object이며 입력 point object를 재사용하지 않는다.
 * `epsilon`은 collinear/수렴 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param segment 교차를 구할 segment
 * @param polygon 교차를 구할 polygon
 * @param epsilon collinear/수렴 판정 임계값
 */
export function segmentPolygonOverlapIntervals(
  segment: SegmentLike,
  polygon: PolygonLike,
  epsilon = DEFAULT_EPSILON
): LinePolygonOverlapIntervalDetail[] {
  const out: LinePolygonOverlapIntervalDetail[] = [];
  segmentPolygonOverlapIntervalsInto(out, segment, polygon, epsilon);
  return out;
}
