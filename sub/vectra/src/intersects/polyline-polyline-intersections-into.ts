import { DEFAULT_EPSILON } from '../internal/numeric';
import { readPolylinePoints } from '../internal/polyline';
import { readX, readY } from '../internal/xy';
import type { PolylineLike, XYObjectWritable } from '../types';
import { hasNearbyPoint, hasNonFinitePolylinePoint, snapshotPolylinePoints } from './polyline-intersections.internal';
import { segmentSegmentDetailXY } from './segment-segment-detail.internal';

interface LocalHit {
  x: number;
  y: number;
  tA: number;
}

/**
 * 두 polyline boundary의 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * subject polyline의 인접 segment를 순서대로 순회하며 각 segment와 target polyline의 모든 segment를
 * `segmentSegmentDetail`로 교차시켜 boundary 교점을 모은다. polyline은 open path이므로 마지막
 * point에서 첫 point로 닫지 않는다.
 * - transversal crossing은 교점 1점, shared vertex/segment endpoint 중복은 dedupe된 1점이다.
 * - collinear overlap은 clipped overlap start/end 두 점을 노출하고, 두 점이 epsilon 이하로
 *   수렴하면 1점으로 dedupe한다.
 * - zero-length segment는 point relation으로 환원하지 않고 건너뛴다. 두 polyline이 모두 valid
 *   segment가 없으면 빈 배열이다.
 * - `points.length < 2`, 좌표가 하나라도 non-finite이면 빈 배열이다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. `outPoints`가 subject/target polyline array와
 * 같은 reference여도 alias-safe하도록 clear 전에 입력 좌표를 snapshot한다. push되는 point는 매 호출 새
 * `{ x, y }` object이며 입력 point object를 재사용하지 않는다. subject와 target이 같은 object여도
 * 입력 좌표를 그대로 재사용하지 않는다. 반환 순서는 subject segment index 오름차순이고, 같은 subject segment 안에서는
 * subject segment-local parameter `t` 오름차순이다(target segment index는 동률 tie-break).
 * `epsilon`은 평행/거리/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다. range 판정은
 * segment-local parameter의 정확 비교를 따른다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param subject 첫 번째 polyline. point ordering의 기준이다.
 * @param target 두 번째 polyline
 * @param epsilon 평행/거리/dedupe 판정 임계값
 */
export function polylinePolylineIntersectionsInto(
  outPoints: XYObjectWritable[],
  subject: PolylineLike,
  target: PolylineLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const subPts = snapshotPolylinePoints(readPolylinePoints(subject));
  const tgtPts = snapshotPolylinePoints(readPolylinePoints(target));
  outPoints.length = 0;
  if (subPts.length < 2 || tgtPts.length < 2) return outPoints;
  if (hasNonFinitePolylinePoint(subPts) || hasNonFinitePolylinePoint(tgtPts)) return outPoints;

  const epsSq = epsilon * epsilon;
  for (let i = 0; i < subPts.length - 1; i++) {
    const ax0 = readX(subPts[i]);
    const ay0 = readY(subPts[i]);
    const ax1 = readX(subPts[i + 1]);
    const ay1 = readY(subPts[i + 1]);
    // zero-length subject segment는 point relation으로 환원하지 않고 건너뛴다.
    if (ax0 === ax1 && ay0 === ay1) continue;

    const local: LocalHit[] = [];
    for (let j = 0; j < tgtPts.length - 1; j++) {
      const bx0 = readX(tgtPts[j]);
      const by0 = readY(tgtPts[j]);
      const bx1 = readX(tgtPts[j + 1]);
      const by1 = readY(tgtPts[j + 1]);
      // zero-length target segment도 동일하게 건너뛴다.
      if (bx0 === bx1 && by0 === by1) continue;

      const detail = segmentSegmentDetailXY(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1, epsilon);
      if (detail.kind === 'point') {
        local.push({ x: detail.point.x, y: detail.point.y, tA: detail.tA });
      } else if (detail.kind === 'overlap') {
        local.push({ x: detail.start.x, y: detail.start.y, tA: detail.tA[0] });
        local.push({ x: detail.end.x, y: detail.end.y, tA: detail.tA[1] });
      }
    }

    // 같은 subject segment 안에서는 segment-local parameter tA 오름차순으로 정렬한다.
    // 동률 tA(같은 좌표)는 stable sort로 target segment index 순서를 유지하고 dedupe로 1점만 남는다.
    local.sort((p, q) => p.tA - q.tA);
    for (let k = 0; k < local.length; k++) {
      if (!hasNearbyPoint(outPoints, local[k].x, local[k].y, epsSq)) {
        outPoints.push({ x: local[k].x, y: local[k].y });
      }
    }
  }

  return outPoints;
}
