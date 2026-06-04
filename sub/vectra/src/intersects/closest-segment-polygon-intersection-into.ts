import { DEFAULT_EPSILON } from '../internal/numeric';
import { closestLineFamilyPolygonIntersectionInto } from '../internal/polygon-line-intersections';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { LinePolygonIntersectionHit, PolygonLike, SegmentLike, XYObjectWritable, XYWritable } from '../types';

/**
 * segment와 polygon edge의 가장 가까운 교점을 out에 기록하고 true를 반환한다.
 *
 * `segmentPolygonIntersections` collection의 첫 hit(segment parameter `tLine` 최소)을 source of
 * truth로 사용한다. 별도 교점 계산으로 drift를 만들지 않는다.
 * out에는 `point`=교점, `kind`=edge-level 교차 종류(`cross`/`touch`/`overlap`),
 * `tLine`=segment parameter `[0, 1]`, `tEdge`=edge-local parameter `[0, 1]`, `edgeIndex`=polygon edge
 * index를 기록한다. overlap이 첫 hit이면 overlap 구간 시작점(`kind: 'overlap'`)을 기록한다.
 *
 * - 교점이 없으면(containment-only segment 포함) `false`를 반환하고 out을 수정하지 않는다.
 * - empty polygon(`points.length < 3`)과 degenerate segment direction(zero-length)도 `false`다.
 *
 * out.point는 매 호출 새로 기록하므로 좌표를 받을 writable storage여야 한다.
 * `epsilon`은 collinear/vertex dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param out 교점을 기록할 writable hit (no-hit이면 미수정)
 * @param segment 교점을 구할 segment
 * @param polygon 교점을 구할 polygon
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function closestSegmentPolygonIntersectionInto<P extends XYWritable = XYObjectWritable>(
  out: LinePolygonIntersectionHit<P>,
  segment: SegmentLike,
  polygon: PolygonLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const a = readSegmentA(segment);
  const b = readSegmentB(segment);
  const ax = readX(a);
  const ay = readY(a);
  return closestLineFamilyPolygonIntersectionInto(
    out,
    ax,
    ay,
    readX(b) - ax,
    readY(b) - ay,
    'finite',
    polygon,
    epsilon
  );
}
